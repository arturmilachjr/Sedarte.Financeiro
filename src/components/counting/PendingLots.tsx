import { useLots } from '@/hooks/useLots'
import { Link } from 'react-router-dom'
import { ClipboardList, AlertTriangle, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { isHighVigilance } from '@/lib/constants'

export function PendingLots() {
  const { lots, loading } = useLots({ pendingOnly: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6" />
            Lotes Pendentes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{lots.length} lotes aguardando contagem</p>
        </div>
        {lots.length > 0 && (
          <Link
            to="/contagem"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Iniciar Contagem
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : lots.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Todos os lotes já foram contados!
        </div>
      ) : (
        <div className="space-y-2">
          {lots.map((lot) => (
            <div key={lot.id} className="p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                {lot.item && isHighVigilance(lot.item.category) && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                )}
                <span className="font-medium text-foreground">
                  {lot.item?.name || 'Item'} — Lote {lot.batch}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 ml-6">
                Esperado: {lot.expected_qty} | Val: {formatDate(lot.expiration_date)}
                {lot.manufacturer && ` | ${lot.manufacturer}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
