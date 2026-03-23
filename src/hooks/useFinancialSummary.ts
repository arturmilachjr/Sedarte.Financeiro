import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { FinancialSummaryItem, FinancialDoc, FixedExpense } from '@/lib/types'

interface FixedExpenseStatus {
  expense: FixedExpense
  paid: boolean
  paidDate: string | null
  paidBy: string | null
  docId: string | null
  paymentMethod: string | null
}

interface Summary {
  items: FinancialSummaryItem[]
  totalReceitas: number
  totalDespesas: number
  resultado: number
  receitasByCategory: Record<string, number>
  despesasByCategory: Record<string, number>
  fixedExpenseStatuses: FixedExpenseStatus[]
}

export function useFinancialSummary(month: string) {
  const [summary, setSummary] = useState<Summary>({
    items: [],
    totalReceitas: 0,
    totalDespesas: 0,
    resultado: 0,
    receitasByCategory: {},
    despesasByCategory: {},
    fixedExpenseStatuses: [],
  })
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)

    // Fetch invoices for the month (as expenses)
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('is_financial', true)

    const monthInvoices = (invoices || []).filter((inv) => {
      if (!inv.purchase_date) return false
      return inv.purchase_date.slice(0, 7) === month
    })

    // Fetch financial_docs for the month
    const { data: docs } = await supabase
      .from('financial_docs')
      .select('*, fixed_expense:fixed_expenses(*)')
      .eq('reference_month', month)
      .neq('status', 'descartado')

    // Fetch fixed expenses
    const { data: fixedExpenses } = await supabase
      .from('fixed_expenses')
      .select('*')
      .eq('is_active', true)

    // Build unified items
    const items: FinancialSummaryItem[] = []

    for (const inv of monthInvoices) {
      items.push({
        direction: 'saida',
        doc_type: 'NOTA_FISCAL',
        supplier_client: inv.supplier,
        value: inv.total_value || 0,
        doc_date: inv.purchase_date,
        source_id: inv.id,
        source_table: 'invoice',
      })
    }

    for (const doc of (docs as FinancialDoc[]) || []) {
      items.push({
        direction: doc.direction,
        doc_type: doc.doc_type,
        supplier_client: doc.supplier_client,
        value: doc.value || 0,
        doc_date: doc.doc_date,
        source_id: doc.id,
        source_table: 'financial_doc',
        description: doc.description,
        partner_responsible: doc.partner_responsible,
        fixed_expense_id: doc.fixed_expense_id,
        is_regulatory: doc.fixed_expense?.is_regulatory,
        payment_method: doc.payment_method,
      })
    }

    // Compute totals
    const totalReceitas = items
      .filter((i) => i.direction === 'entrada')
      .reduce((sum, i) => sum + i.value, 0)

    const totalDespesas = items
      .filter((i) => i.direction === 'saida')
      .reduce((sum, i) => sum + i.value, 0)

    // Group by category
    const receitasByCategory: Record<string, number> = {}
    const despesasByCategory: Record<string, number> = {}

    for (const item of items) {
      const catMap = item.direction === 'entrada' ? receitasByCategory : despesasByCategory
      const cat = item.source_table === 'invoice'
        ? 'Fornecedores (NFs)'
        : item.fixed_expense_id
          ? 'Despesas fixas'
          : getCategoryLabel(item.doc_type)

      catMap[cat] = (catMap[cat] || 0) + item.value
    }

    // Fixed expense statuses
    const fixedExpenseStatuses: FixedExpenseStatus[] = ((fixedExpenses as FixedExpense[]) || []).map((fe) => {
      const matchingDoc = (docs as FinancialDoc[] || []).find(
        (d) => d.fixed_expense_id === fe.id && d.status === 'ok'
      )
      return {
        expense: fe,
        paid: !!matchingDoc,
        paidDate: matchingDoc?.doc_date || null,
        paidBy: matchingDoc?.partner_responsible || null,
        docId: matchingDoc?.id || null,
        paymentMethod: matchingDoc?.payment_method || null,
      }
    })

    setSummary({
      items,
      totalReceitas,
      totalDespesas,
      resultado: totalReceitas - totalDespesas,
      receitasByCategory,
      despesasByCategory,
      fixedExpenseStatuses,
    })
    setLoading(false)
  }, [month])

  useEffect(() => { fetch() }, [fetch])

  return { summary, loading, refetch: fetch }
}

function getCategoryLabel(docType: string): string {
  switch (docType) {
    case 'nfse_emitida': return 'NFS-e emitidas'
    case 'guia_tributaria': return 'Guias tributárias'
    case 'espelho_das': return 'Guias tributárias'
    case 'boleto': return 'Boletos'
    case 'recibo': return 'Honorários'
    default: return 'Outras'
  }
}
