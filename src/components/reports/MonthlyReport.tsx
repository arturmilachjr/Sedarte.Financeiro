import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFinancialSummary } from '@/hooks/useFinancialSummary'
import { usePartnerShares } from '@/hooks/usePartnerShares'
import { useFinancialDocs } from '@/hooks/useFinancialDocs'
import { BarChart3, Download } from 'lucide-react'
import { MonthSelector } from '@/components/financial/MonthSelector'
import { formatCurrency, formatMonthLabelFull, getCurrentMonth, generateCsv } from '@/lib/utils'
import { RegulatoryBadge } from '@/components/shared/RegulatoryBadge'
import { DOC_TYPE_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { DocType, PaymentMethod } from '@/lib/types'

export function MonthlyReport() {
  const [searchParams] = useSearchParams()
  const initialMonth = searchParams.get('month') || getCurrentMonth()
  const [month, setMonth] = useState(initialMonth)

  const { summary, loading } = useFinancialSummary(month)
  const { shares } = usePartnerShares(month)
  const { docs } = useFinancialDocs(month)

  function exportCsv() {
    const headers = ['Data', 'Tipo', 'Categoria', 'Descricao', 'Fornecedor_Cliente', 'Valor', 'Forma_Pgto', 'Socio', 'Regulatorio', 'Obs']
    const rows = summary.items.map((item) => [
      item.doc_date || '',
      item.direction === 'entrada' ? 'ENTRADA' : 'SAIDA',
      item.source_table === 'invoice' ? 'NOTA_FISCAL' : (item.fixed_expense_id ? 'DESPESA_FIXA' : (DOC_TYPE_LABELS[item.doc_type as DocType] || item.doc_type).toUpperCase()),
      item.description || (item.source_table === 'invoice' ? `NF ${item.supplier_client}` : ''),
      item.supplier_client || '',
      item.value.toFixed(2),
      item.payment_method ? (PAYMENT_METHOD_LABELS[item.payment_method as PaymentMethod] || item.payment_method) : '',
      item.partner_responsible || '',
      item.is_regulatory ? 'SIM' : 'NAO',
      '',
    ])

    generateCsv(headers, rows, `sedarte_demonstrativo_${month}.csv`)
  }

  const totalDespesasFixas = summary.fixedExpenseStatuses.reduce(
    (sum, s) => sum + s.expense.value,
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Demonstrativo Mensal
        </h1>
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <>
          {/* Report card */}
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-primary/10 border-b border-border text-center">
              <h2 className="text-sm font-bold text-foreground uppercase">Sedarte Anestesia Móvel Ltda.</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Demonstrativo Mensal — {formatMonthLabelFull(month)}
              </p>
            </div>

            {/* Receitas */}
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">RECEITAS</h3>
              {Object.entries(summary.receitasByCategory).map(([cat, value]) => (
                <div key={cat} className="flex justify-between text-sm py-0.5">
                  <span className="text-muted-foreground">{cat}</span>
                  <span className="text-foreground">{formatCurrency(value)}</span>
                </div>
              ))}
              {Object.keys(summary.receitasByCategory).length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma receita registrada</p>
              )}
              <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-border">
                <span className="text-foreground">TOTAL RECEITAS</span>
                <span className="text-success">{formatCurrency(summary.totalReceitas)}</span>
              </div>
            </div>

            {/* Despesas */}
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">DESPESAS</h3>
              {Object.entries(summary.despesasByCategory).map(([cat, value]) => (
                <div key={cat} className="flex justify-between text-sm py-0.5">
                  <span className="text-muted-foreground">{cat}</span>
                  <span className="text-foreground">{formatCurrency(value)}</span>
                </div>
              ))}

              {/* Fixed expense details */}
              {summary.fixedExpenseStatuses.length > 0 && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {summary.fixedExpenseStatuses.map((s) => (
                    <div key={s.expense.id} className="flex justify-between text-xs py-0.5">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {s.expense.description}
                        {s.expense.is_regulatory && <RegulatoryBadge size="sm" />}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground">{formatCurrency(s.expense.value)}</span>
                        <span className={s.paid ? 'text-success' : 'text-warning'}>
                          {s.paid ? '✅' : '⏳'}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-border">
                <span className="text-foreground">TOTAL DESPESAS</span>
                <span className="text-destructive">{formatCurrency(summary.totalDespesas)}</span>
              </div>
            </div>

            {/* Resultado */}
            <div className="p-4 border-b border-border">
              <div className="flex justify-between text-base font-bold">
                <span className="text-foreground">RESULTADO DO MÊS</span>
                <span className={summary.resultado >= 0 ? 'text-success' : 'text-destructive'}>
                  {formatCurrency(summary.resultado)} {summary.resultado >= 0 ? '✅' : '❌'}
                </span>
              </div>
            </div>

            {/* Rateio */}
            {shares.length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-2">CONTRIBUIÇÃO DOS SÓCIOS (despesas fixas)</h3>
                {shares.map((share) => {
                  const expected = (totalDespesasFixas * share.share_pct) / 100
                  const paid = docs
                    .filter((d) => d.direction === 'saida' && d.partner_responsible === share.partner_name && d.fixed_expense_id)
                    .reduce((sum, d) => sum + (d.value || 0), 0)

                  return (
                    <div key={share.id} className="flex justify-between text-sm py-0.5">
                      <span className="text-muted-foreground">{share.partner_name} ({share.share_pct}%)</span>
                      <span className="text-foreground">
                        deveria {formatCurrency(expected)} → pagou {formatCurrency(paid)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Export button */}
          <button
            onClick={exportCsv}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-5 h-5" />
            Exportar CSV para Contador
          </button>
        </>
      )}
    </div>
  )
}
