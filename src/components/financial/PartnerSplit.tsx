import type { PartnerShare, FinancialDoc } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface Props {
  shares: PartnerShare[]
  totalDespesasFixas: number
  docs: FinancialDoc[]
}

export function PartnerSplit({ shares, totalDespesasFixas, docs }: Props) {
  if (shares.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Rateio
        </h2>
        <p className="text-sm text-muted-foreground">Configure o rateio em Configurações</p>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Rateio
      </h2>

      <div className="space-y-3">
        {shares.map((share) => {
          const expected = (totalDespesasFixas * share.share_pct) / 100
          const paid = docs
            .filter((d) => d.direction === 'saida' && d.partner_responsible === share.partner_name && d.fixed_expense_id)
            .reduce((sum, d) => sum + (d.value || 0), 0)
          const pct = expected > 0 ? Math.min(100, (paid / expected) * 100) : 0

          return (
            <div key={share.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground font-medium">
                  {share.partner_name} ({share.share_pct}%)
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(paid)} / {formatCurrency(expected)}
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 100 ? 'bg-success' : pct >= 50 ? 'bg-primary' : 'bg-warning'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground text-right mt-0.5">
                {Math.round(pct)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
