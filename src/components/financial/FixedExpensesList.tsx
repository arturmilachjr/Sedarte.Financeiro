import { formatCurrency, formatDate } from '@/lib/utils'
import { RegulatoryBadge } from '@/components/shared/RegulatoryBadge'
import type { FixedExpense } from '@/lib/types'
import { PAYMENT_METHOD_LABELS } from '@/lib/constants'
import type { PaymentMethod } from '@/lib/types'

interface FixedExpenseStatus {
  expense: FixedExpense
  paid: boolean
  paidDate: string | null
  paidBy: string | null
  docId: string | null
  paymentMethod: string | null
}

interface Props {
  statuses: FixedExpenseStatus[]
  currentDay?: number
}

export function FixedExpensesList({ statuses, currentDay }: Props) {
  const today = currentDay || new Date().getDate()

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Despesas Fixas do Mês
      </h2>

      {statuses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma despesa fixa cadastrada</p>
      ) : (
        <div className="space-y-2">
          {statuses.map((s) => {
            const isPending = !s.paid
            const isOverdue = isPending && s.expense.due_day && today > s.expense.due_day

            return (
              <div
                key={s.expense.id}
                className="flex items-center gap-3 py-2"
              >
                <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold ${
                  s.paid ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                }`}>
                  {s.paid ? '✓' : '○'}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm text-foreground">{s.expense.description}</span>
                    <span className="text-sm text-muted-foreground">({formatCurrency(s.expense.value)})</span>
                    {s.expense.is_regulatory && <RegulatoryBadge size="sm" />}
                  </div>
                  {s.paid ? (
                    <div className="text-xs text-muted-foreground">
                      pago {formatDate(s.paidDate)}
                      {s.paymentMethod && ` ${PAYMENT_METHOD_LABELS[s.paymentMethod as PaymentMethod] || s.paymentMethod}`}
                      {s.paidBy && ` — ${s.paidBy}`}
                    </div>
                  ) : (
                    <div className={`text-xs ${isOverdue ? 'text-destructive font-medium' : 'text-warning'}`}>
                      {s.expense.due_day
                        ? `vence dia ${s.expense.due_day} ${isOverdue ? '⚠️ PENDENTE' : ''}`
                        : 'PENDENTE'
                      }
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
