import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInvoices, useInvoiceItems } from '@/hooks/useInvoices'
import { useItems } from '@/hooks/useItems'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Plus, Package, DollarSign, CheckCircle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { isControlled } from '@/lib/constants'

interface ItemEntry {
  item_id: string
  batch: string
  manufacturer: string
  manufacturing_date: string
  expiration_date: string
  quantity: number
  unit_price: number
}

export function InvoiceForm() {
  const navigate = useNavigate()
  const { create: createInvoice } = useInvoices()
  const { items } = useItems()
  const { user } = useAuth()

  const [step, setStep] = useState<'header' | 'items' | 'done'>('header')
  const [invoiceId, setInvoiceId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Header fields
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [supplier, setSupplier] = useState('')
  const [supplierCnpj, setSupplierCnpj] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [notes, setNotes] = useState('')

  // Items
  const [entries, setEntries] = useState<ItemEntry[]>([])
  const [totalValue, setTotalValue] = useState(0)

  async function handleSaveHeader(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const computed = entries.reduce((sum, entry) => sum + entry.quantity * entry.unit_price, 0)
      const inv = await createInvoice({
        invoice_number: invoiceNumber,
        supplier,
        supplier_cnpj: supplierCnpj || null,
        purchase_date: purchaseDate,
        total_value: computed || totalValue,
        notes: notes || null,
        created_by: user?.id,
      })
      setInvoiceId(inv.id)
      setStep('items')
    } catch {
      setError('Erro ao salvar NF')
    } finally {
      setSaving(false)
    }
  }

  function addEntry() {
    setEntries([...entries, {
      item_id: '',
      batch: '',
      manufacturer: '',
      manufacturing_date: '',
      expiration_date: '',
      quantity: 1,
      unit_price: 0,
    }])
  }

  function updateEntry(index: number, field: keyof ItemEntry, value: string | number) {
    const updated = [...entries]
    ;(updated[index] as unknown as Record<string, string | number>)[field] = value
    setEntries(updated)

    const newTotal = updated.reduce((sum, e) => sum + e.quantity * e.unit_price, 0)
    setTotalValue(newTotal)
  }

  function removeEntry(index: number) {
    setEntries(entries.filter((_, i) => i !== index))
  }

  if (step === 'header') {
    return (
      <div>
        <Link to="/notas-fiscais" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h1 className="text-xl font-bold text-foreground mb-6">Registrar Nova NF</h1>

        <form onSubmit={handleSaveHeader} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Número da NF *</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Data de compra *</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Fornecedor *</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">CNPJ do Fornecedor</label>
            <input
              type="text"
              value={supplierCnpj}
              onChange={(e) => setSupplierCnpj(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-medium text-foreground">Itens da NF</h2>
              <button
                type="button"
                onClick={addEntry}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus className="w-4 h-4" /> Adicionar Item
              </button>
            </div>

            {entries.map((entry, idx) => {
              const selectedItem = items.find(i => i.id === entry.item_id)
              const hasControlled = selectedItem && isControlled(selectedItem.category)

              return (
                <div key={idx} className="p-3 rounded-lg bg-background border border-border mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Item {idx + 1}</span>
                    <button type="button" onClick={() => removeEntry(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {hasControlled && (
                    <div className="text-xs text-red-400 mb-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                      Item controlado — Portaria 344/98
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <select
                        value={entry.item_id}
                        onChange={(e) => updateEntry(idx, 'item_id', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">Selecionar item...</option>
                        {items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {isControlled(item.category) ? '🔴 ' : ''}{item.name}
                            {item.concentration ? ` ${item.concentration}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input type="text" placeholder="Lote *" value={entry.batch} onChange={(e) => updateEntry(idx, 'batch', e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                    <input type="text" placeholder="Fabricante" value={entry.manufacturer} onChange={(e) => updateEntry(idx, 'manufacturer', e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="date" placeholder="Fabricação" value={entry.manufacturing_date} onChange={(e) => updateEntry(idx, 'manufacturing_date', e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="date" placeholder="Validade" value={entry.expiration_date} onChange={(e) => updateEntry(idx, 'expiration_date', e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <input type="number" placeholder="Qtd *" value={entry.quantity || ''} onChange={(e) => updateEntry(idx, 'quantity', parseInt(e.target.value) || 0)} className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" min="1" required />
                    <input type="number" step="0.01" placeholder="Preço un." value={entry.unit_price || ''} onChange={(e) => updateEntry(idx, 'unit_price', parseFloat(e.target.value) || 0)} className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              )
            })}

            {entries.length > 0 && (
              <div className="text-right text-sm font-medium text-foreground mt-2">
                Total: {formatCurrency(totalValue)}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Salvando...' : 'Salvar NF e Criar Lotes'}
          </button>
        </form>
      </div>
    )
  }

  if (step === 'items' && invoiceId) {
    return <InvoiceItemsSaver invoiceId={invoiceId} entries={entries} onDone={() => setStep('done')} />
  }

  // Done
  const month = purchaseDate?.slice(0, 7)
  return (
    <div className="text-center py-12">
      <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">NF salva com sucesso</h2>
      <div className="space-y-2 text-sm">
        <Link to={`/estoque/lotes`} className="flex items-center justify-center gap-2 text-blue-400 hover:underline">
          <Package className="w-4 h-4" /> {entries.length} lotes criados no estoque
        </Link>
        <Link to={`/financeiro`} className="flex items-center justify-center gap-2 text-green-400 hover:underline">
          <DollarSign className="w-4 h-4" /> {formatCurrency(totalValue)} registrados como despesa{month ? ` em ${month}` : ''}
        </Link>
      </div>
      <button
        onClick={() => navigate('/notas-fiscais')}
        className="mt-6 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
      >
        Voltar às NFs
      </button>
    </div>
  )
}

function InvoiceItemsSaver({ invoiceId, entries, onDone }: { invoiceId: string; entries: ItemEntry[]; onDone: () => void }) {
  const { create } = useInvoiceItems(invoiceId)
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    for (const entry of entries) {
      await create({
        invoice_id: invoiceId,
        item_id: entry.item_id,
        batch: entry.batch,
        manufacturer: entry.manufacturer || null,
        manufacturing_date: entry.manufacturing_date || null,
        expiration_date: entry.expiration_date || null,
        quantity: entry.quantity,
        unit_price: entry.unit_price || null,
        created_by: user?.id,
      })
    }
    onDone()
  }

  if (!saving) {
    save()
  }

  return (
    <div className="text-center py-12 text-muted-foreground">
      Criando lotes... ({entries.length} itens)
    </div>
  )
}
