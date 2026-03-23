import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { FinancialDoc } from '@/lib/types'
import { useActivityLog } from './useActivityLog'

export function useFinancialDocs(referenceMonth?: string) {
  const [docs, setDocs] = useState<FinancialDoc[]>([])
  const [loading, setLoading] = useState(true)
  const { log } = useActivityLog()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('financial_docs')
      .select('*, fixed_expense:fixed_expenses(*)')
      .neq('status', 'descartado')
      .order('doc_date', { ascending: false })

    if (referenceMonth) {
      query = query.eq('reference_month', referenceMonth)
    }

    const { data } = await query
    setDocs((data as FinancialDoc[]) || [])
    setLoading(false)
  }, [referenceMonth])

  useEffect(() => { fetch() }, [fetch])

  async function create(doc: Partial<FinancialDoc>) {
    const { data, error } = await supabase
      .from('financial_docs')
      .insert(doc)
      .select()
      .single()
    if (error) throw error
    await log('create', 'financial_doc', data.id, `Documento financeiro criado: ${doc.description}`)
    await fetch()
    return data as FinancialDoc
  }

  async function update(id: string, updates: Partial<FinancialDoc>) {
    const { error } = await supabase
      .from('financial_docs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await log('update', 'financial_doc', id, `Documento financeiro atualizado`)
    await fetch()
  }

  return { docs, loading, create, update, refetch: fetch }
}
