import { useState } from 'react'
import { useLots } from '@/hooks/useLots'
import { Package, AlertTriangle, CheckCircle, Search } from 'lucide-react'
import { ControlledBadge } from '@/components/shared/ControlledBadge'
import { CrossRefBadge } from '@/components/shared/CrossRefBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { isHighVigilance } from '@/lib/constants'

export function LotsList() {
  const { lots, loading } = useLots()
  const [search, setSearch] = useState('')

  const filtered = lots.filter((lot) => {
    const itemName = lot.item?.name || ''
    const batch = lot.batch || ''
    return (
      itemName.toLowerCase().includes(search.toLowerCase()) ||
      batch.toLowerCase().includes(search.toLowerCase())
    )
  })

  function getStatus(lot: typeof lots[0]) {
    if (lot.counted_qty === null) return 'pending'
    if (lot.counted_qty === lot.expected_qty) return 'ok'
    if (lot.counted_qty < lot.expected_qty) return 'shortage'
    return 'surplus'
  }

  function isExpiringSoon(date: string | null): boolean {
    if (!date) return false
    const exp = new Date(date)
    const now = new Date()
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 90 && diff > 0
  }

  function isExpired(date: string | null): boolean {
    if (!date) return false
    return new Date(date) < new Date()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Package className="w-6 h-6" />
          Lotes em Estoque
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{lots.length} lotes registrados</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por item ou lote..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum lote encontrado</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lot) => {
            const status = getStatus(lot)
            const item = lot.item

            return (
              <div
                key={lot.id}
                className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item && isHighVigilance(item.category) && (
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                      )}
                      <span className="font-medium text-foreground">
                        {item?.name || 'Item desconhecido'}
                      </span>
                      {item?.concentration && (
                        <span className="text-sm text-muted-foreground">{item.concentration}</span>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground mt-1">
                      Lote {lot.batch}
                      {lot.manufacturer && ` — ${lot.manufacturer}`}
                    </div>

                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                      <span className={`${isExpired(lot.expiration_date) ? 'text-destructive font-medium' : isExpiringSoon(lot.expiration_date) ? 'text-warning font-medium' : 'text-muted-foreground'}`}>
                        Val: {formatDate(lot.expiration_date)}
                        {isExpired(lot.expiration_date) && ' ⚠️ VENCIDO'}
                        {isExpiringSoon(lot.expiration_date) && !isExpired(lot.expiration_date) && ' ⚠️'}
                      </span>
                    </div>

                    {item && (
                      <div className="mt-2">
                        <ControlledBadge
                          category={item.category}
                          portaria344Class={item.portaria344_class}
                          size="sm"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {lot.invoice && (
                        <CrossRefBadge
                          type="invoice"
                          label={`NF ${lot.invoice.invoice_number} — ${formatCurrency(lot.invoice.total_value)}`}
                          link={`/notas-fiscais/${lot.invoice.id}`}
                        />
                      )}
                      <CrossRefBadge
                        type="count"
                        label={`${lot.expected_qty} esperados${lot.counted_qty !== null ? ` / ${lot.counted_qty} contados` : ' — pendente'}`}
                        link={`/contagem?lot=${lot.id}`}
                      />
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {status === 'ok' && <CheckCircle className="w-5 h-5 text-success" />}
                    {status === 'pending' && <AlertTriangle className="w-5 h-5 text-warning" />}
                    {status === 'shortage' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                    {status === 'surplus' && <AlertTriangle className="w-5 h-5 text-blue-400" />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
