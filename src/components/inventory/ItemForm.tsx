import { useState } from 'react'
import { useItems } from '@/hooks/useItems'
import { useAuth } from '@/contexts/AuthContext'
import { X } from 'lucide-react'
import { ITEM_CATEGORY_LABELS } from '@/lib/constants'
import type { ItemCategory } from '@/lib/types'

interface Props {
  onClose: () => void
}

export function ItemForm({ onClose }: Props) {
  const { create } = useItems()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ItemCategory>('medicamento')
  const [unit, setUnit] = useState('')
  const [concentration, setConcentration] = useState('')
  const [portaria344Class, setPortaria344Class] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const showPortaria = category === 'controlado' || category === 'alta_vigilancia'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await create({
        name,
        category,
        unit,
        concentration: concentration || null,
        portaria344_class: showPortaria ? (portaria344Class || null) : null,
        notes: notes || null,
        created_by: user?.id,
      })
      onClose()
    } catch {
      setError('Erro ao salvar item')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Novo Item</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Categoria *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unidade *</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="mL, cp, un..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Concentração</label>
            <input
              type="text"
              value={concentration}
              onChange={(e) => setConcentration(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="200mg/20mL"
            />
          </div>

          {showPortaria && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Classificação Portaria 344/98
              </label>
              <input
                type="text"
                value={portaria344Class}
                onChange={(e) => setPortaria344Class(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Lista C1, B1, A1..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? 'Salvando...' : 'Salvar Item'}
          </button>
        </form>
      </div>
    </div>
  )
}
