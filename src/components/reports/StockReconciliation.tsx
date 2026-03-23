import { useLots } from '@/hooks/useLots'
import { BarChart3, CheckCircle, AlertTriangle, HelpCircle, ArrowUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { isHighVigilance } from '@/lib/constants'

type Status = 'conforme' | 'falta' | 'sobra' | 'sem_contagem' | 'sem_nf'

export function StockReconciliation() {
  const { lots, loading } = useLots()

  function getStatus(lot: typeof lots[0]): Status {
    if (!lot.invoice_id) return 'sem_nf'
    if (lot.counted_qty === null) return 'sem_contagem'
    if (lot.counted_qty === lot.expected_qty) return 'conforme'
    if (lot.counted_qty < lot.expected_qty) return 'falta'
    return 'sobra'
  }

  const categorized = {
    conforme: lots.filter((l) => getStatus(l) === 'conforme'),
    falta: lots.filter((l) => getStatus(l) === 'falta'),
    sobra: lots.filter((l) => getStatus(l) === 'sobra'),
    sem_contagem: lots.filter((l) => getStatus(l) === 'sem_contagem'),
    sem_nf: lots.filter((l) => getStatus(l) === 'sem_nf'),
  }

  const statusConfig: Record<Status, { label: string; color: string; icon: typeof CheckCircle }> = {
    conforme: { label: 'Conforme', color: 'text-success', icon: CheckCircle },
    falta: { label: 'Falta', color: 'text-destructive', icon: AlertTriangle },
    sobra: { label: 'Sobra', color: 'text-blue-400', icon: ArrowUp },
    sem_contagem: { label: 'Sem Contagem', color: 'text-warning', icon: HelpCircle },
    sem_nf: { label: 'Sem NF', color: 'text-muted-foreground', icon: HelpCircle },
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6" />
        Conciliação de Estoque
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        {(Object.entries(categorized) as [Status, typeof lots][]).map(([status, items]) => {
          const config = statusConfig[status]
          return (
            <div key={status} className="p-3 rounded-lg bg-card border border-border text-center">
              <div className={`text-2xl font-bold ${config.color}`}>{items.length}</div>
              <div className="text-xs text-muted-foreground">{config.label}</div>
            </div>
          )
        })}
      </div>

      {/* Details by status */}
      {(Object.entries(categorized) as [Status, typeof lots][])
        .filter(([, items]) => items.length > 0)
        .map(([status, items]) => {
          const config = statusConfig[status]
          const Icon = config.icon

          return (
            <div key={status} className="mb-6">
              <h2 className={`text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2 ${config.color}`}>
                <Icon className="w-4 h-4" />
                {config.label} ({items.length})
              </h2>
              <div className="space-y-1">
                {items.map((lot) => (
                  <div key={lot.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border text-sm">
                    <div className="flex items-center gap-2">
                      {lot.item && isHighVigilance(lot.item.category) && (
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                      <span className="text-foreground">{lot.item?.name || 'Item'}</span>
                      <span className="text-muted-foreground">— Lote {lot.batch}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>Esp: {lot.expected_qty}</span>
                      {lot.counted_qty !== null && <span>Cont: {lot.counted_qty}</span>}
                      <span>Val: {formatDate(lot.expiration_date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}
