import { useState } from 'react'
import { useFixedExpenses } from '@/hooks/useFixedExpenses'
import { useAuth } from '@/contexts/AuthContext'
import { Settings, Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { RegulatoryBadge } from '@/components/shared/RegulatoryBadge'

export function FixedExpensesConfig() {
  const { expenses, loading, create, deactivate } = useFixedExpenses()
  const { user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const [newDesc, setNewDesc] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newDueDay, setNewDueDay] = useState('')
  const [newRegulatory, setNewRegulatory] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await create({
        description: newDesc,
        value: parseFloat(newValue.replace(',', '.')),
        due_day: newDueDay ? parseInt(newDueDay) : null,
        is_regulatory: newRegulatory,
        created_by: user?.id,
      })
      setNewDesc('')
      setNewValue('')
      setNewDueDay('')
      setNewRegulatory(false)
      setShowAdd(false)
    } catch {
      // handled
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Despesas Fixas
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <Plus className="w-4 h-4" /> Adicionar
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-4 rounded-lg bg-background border border-border mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descrição *"
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Valor (R$) *"
              className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <input
              type="number"
              value={newDueDay}
              onChange={(e) => setNewDueDay(e.target.value)}
              placeholder="Vence dia"
              min="1"
              max="31"
              className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={newRegulatory}
              onChange={(e) => setNewRegulatory(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Obrigação regulatória 🏥
          </label>
          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      )}

      {expenses.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma despesa fixa cadastrada</p>
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{exp.description}</span>
                  {exp.is_regulatory && <RegulatoryBadge size="sm" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(exp.value)}
                  {exp.due_day && ` — vence dia ${exp.due_day}`}
                </div>
              </div>
              <button
                onClick={() => deactivate(exp.id)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                title="Desativar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
