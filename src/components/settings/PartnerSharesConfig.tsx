import { useState } from 'react'
import { usePartnerShares } from '@/hooks/usePartnerShares'
import { useAuth } from '@/contexts/AuthContext'
import { Users } from 'lucide-react'
import { getCurrentMonth, formatMonthLabel } from '@/lib/utils'

export function PartnerSharesConfig() {
  const { shares, loading, createShares } = usePartnerShares()
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [newShares, setNewShares] = useState<{ name: string; pct: string }[]>([])
  const [effectiveFrom, setEffectiveFrom] = useState(getCurrentMonth())
  const [saving, setSaving] = useState(false)

  function startEdit() {
    setNewShares(
      shares.length > 0
        ? shares.map((s) => ({ name: s.partner_name, pct: String(s.share_pct) }))
        : [
            { name: 'Sarah', pct: '40' },
            { name: 'Lorena', pct: '40' },
            { name: 'Artur', pct: '20' },
          ]
    )
    setEditing(true)
  }

  async function handleSave() {
    const totalPct = newShares.reduce((sum, s) => sum + parseFloat(s.pct || '0'), 0)
    if (Math.abs(totalPct - 100) > 0.01) {
      alert('O total deve ser 100%')
      return
    }

    setSaving(true)
    try {
      await createShares(
        newShares.map((s) => ({
          partner_name: s.name,
          share_pct: parseFloat(s.pct),
          effective_from: effectiveFrom,
          created_by: user?.id,
        }))
      )
      setEditing(false)
    } catch {
      // handled
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>

  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
        <Users className="w-5 h-5" />
        Rateio entre Sócios
      </h2>

      {!editing ? (
        <>
          {shares.length === 0 ? (
            <p className="text-sm text-muted-foreground mb-3">Nenhum rateio configurado</p>
          ) : (
            <div className="space-y-2 mb-4">
              {shares.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <span className="text-sm font-medium text-foreground">{s.partner_name}</span>
                  <span className="text-sm text-muted-foreground">
                    {s.share_pct}% — desde {formatMonthLabel(s.effective_from)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={startEdit}
            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Alterar rateio
          </button>
        </>
      ) : (
        <div className="p-4 rounded-lg bg-background border border-border space-y-3">
          {newShares.map((s, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={s.name}
                onChange={(e) => {
                  const updated = [...newShares]
                  updated[idx].name = e.target.value
                  setNewShares(updated)
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nome"
              />
              <div className="relative w-24">
                <input
                  type="number"
                  value={s.pct}
                  onChange={(e) => {
                    const updated = [...newShares]
                    updated[idx].pct = e.target.value
                    setNewShares(updated)
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="%"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs text-muted-foreground mb-1">A partir de</label>
            <input
              type="month"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Rateio'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:opacity-90"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
