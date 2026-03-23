import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Invoice, InvoiceItem, Lot } from '@/lib/types'
import { ArrowLeft, FileText, Package, DollarSign, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ControlledBadge } from '@/components/shared/ControlledBadge'
import { isControlled } from '@/lib/constants'

export function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const [invRes, itemsRes, lotsRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('id', id).single(),
        supabase.from('invoice_items').select('*, item:items(*)').eq('invoice_id', id),
        supabase.from('lots').select('*, item:items(*)').eq('invoice_id', id),
      ])
      setInvoice(invRes.data as Invoice)
      setItems((itemsRes.data as InvoiceItem[]) || [])
      setLots((lotsRes.data as Lot[]) || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>
  if (!invoice) return <div className="text-center py-12 text-muted-foreground">NF não encontrada</div>

  const hasControlled = items.some((i) => i.item && isControlled(i.item.category))
  const month = invoice.purchase_date?.slice(0, 7)

  return (
    <div>
      <Link to="/notas-fiscais" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-foreground" />
        <div>
          <h1 className="text-xl font-bold text-foreground">NF {invoice.invoice_number}</h1>
          <p className="text-sm text-muted-foreground">{invoice.supplier}</p>
        </div>
      </div>

      {hasControlled && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Esta NF contém itens controlados (Portaria 344/98)
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="text-xs text-muted-foreground">Data da compra</div>
          <div className="text-sm font-medium text-foreground mt-1">{formatDate(invoice.purchase_date)}</div>
        </div>
        <div className="p-3 rounded-lg bg-card border border-border">
          <div className="text-xs text-muted-foreground">Valor total</div>
          <div className="text-sm font-medium text-foreground mt-1">{formatCurrency(invoice.total_value)}</div>
        </div>
      </div>

      {/* Cross-references */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Link to="/estoque/lotes" className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:underline">
          <Package className="w-4 h-4" />
          {lots.length} lotes criados
        </Link>
        {invoice.is_financial && month && (
          <Link to="/financeiro" className="inline-flex items-center gap-1.5 text-sm text-green-400 hover:underline">
            <DollarSign className="w-4 h-4" />
            Registrado como despesa
          </Link>
        )}
      </div>

      {/* Items */}
      <h2 className="text-base font-medium text-foreground mb-3">Itens ({items.length})</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="p-3 rounded-lg bg-card border border-border">
            <div className="flex items-center gap-2">
              {item.item && isControlled(item.item.category) && (
                <span className="w-2 h-2 bg-red-500 rounded-full" />
              )}
              <span className="font-medium text-foreground text-sm">
                {item.item?.name || 'Item'}
                {item.item?.concentration && ` ${item.item.concentration}`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
              <span>Lote: {item.batch}</span>
              {item.manufacturer && <span>Fab: {item.manufacturer}</span>}
              <span>Qtd: {item.quantity}</span>
              {item.unit_price && <span>{formatCurrency(item.unit_price)}/un</span>}
              {item.expiration_date && <span>Val: {formatDate(item.expiration_date)}</span>}
            </div>
            {item.item && (
              <ControlledBadge category={item.item.category} portaria344Class={item.item.portaria344_class} size="sm" />
            )}
          </div>
        ))}
      </div>

      {invoice.notes && (
        <div className="mt-6">
          <h2 className="text-base font-medium text-foreground mb-2">Observações</h2>
          <p className="text-sm text-muted-foreground">{invoice.notes}</p>
        </div>
      )}
    </div>
  )
}
