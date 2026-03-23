import { useState } from 'react'
import { useInvoices } from '@/hooks/useInvoices'
import { Link } from 'react-router-dom'
import { Plus, Search, FileText, Package, DollarSign, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export function InvoiceList() {
  const { invoices, loading } = useInvoices()
  const [search, setSearch] = useState('')

  const filtered = invoices.filter((inv) =>
    inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
    inv.supplier?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Notas Fiscais
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{invoices.length} NFs registradas</p>
        </div>
        <Link
          to="/notas-fiscais/nova"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova NF</span>
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número ou fornecedor..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search ? 'Nenhuma NF encontrada' : 'Nenhuma NF registrada'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inv) => {
            const month = inv.purchase_date?.slice(0, 7)
            return (
              <Link
                key={inv.id}
                to={`/notas-fiscais/${inv.id}`}
                className={cn(
                  "block p-4 rounded-lg bg-card border border-border",
                  "hover:border-primary/50 transition-colors"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-foreground">
                      NF {inv.invoice_number} — {inv.supplier}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDate(inv.purchase_date)} — {formatCurrency(inv.total_value)}
                    </div>
                    <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
                      <span className="inline-flex items-center gap-1 text-blue-400">
                        <Package className="w-3.5 h-3.5" />
                        Lotes criados
                      </span>
                      {inv.is_financial && month && (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <DollarSign className="w-3.5 h-3.5" />
                          Despesa registrada
                        </span>
                      )}
                    </div>
                  </div>
                  {inv.notes?.includes('controlado') && (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
