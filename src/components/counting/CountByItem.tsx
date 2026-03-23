import { useState } from 'react'
import { useLots } from '@/hooks/useLots'
import { useAuth } from '@/contexts/AuthContext'
import { ClipboardList, Minus, Plus, Check, ChevronRight } from 'lucide-react'
import { ControlledBadge } from '@/components/shared/ControlledBadge'
import { isHighVigilance } from '@/lib/constants'

export function CountByItem() {
  const { lots, loading, updateCount } = useLots()
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [countValue, setCountValue] = useState(0)
  const [saving, setSaving] = useState(false)

  // Filter to lots that need counting
  const pendingLots = lots.filter((l) => l.counted_qty === null)

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>

  if (pendingLots.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Tudo contado!</h2>
        <p className="text-sm text-muted-foreground mt-2">Não há lotes pendentes de contagem.</p>
      </div>
    )
  }

  const lot = pendingLots[currentIndex]
  if (!lot) {
    return (
      <div className="text-center py-12">
        <Check className="w-16 h-16 text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Contagem concluída!</h2>
        <p className="text-sm text-muted-foreground mt-2">Todos os lotes selecionados foram contados.</p>
      </div>
    )
  }

  const item = lot.item

  async function handleSave() {
    setSaving(true)
    try {
      await updateCount(lot.id, countValue, user?.id || '')
      setCountValue(0)
      setCurrentIndex((i) => i + 1)
    } catch {
      // error handled silently
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-6 h-6" />
          Contagem Física
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {currentIndex + 1} de {pendingLots.length} pendentes
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full mb-6">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${(currentIndex / pendingLots.length) * 100}%` }}
        />
      </div>

      {/* Current lot card */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {item && isHighVigilance(item.category) && (
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
          <h2 className="text-lg font-bold text-foreground">
            {item?.name || 'Item desconhecido'}
          </h2>
          {item?.concentration && (
            <span className="text-muted-foreground">{item.concentration}</span>
          )}
        </div>

        <div className="text-sm text-muted-foreground mb-2">
          Lote: {lot.batch}
          {lot.manufacturer && ` — ${lot.manufacturer}`}
        </div>

        {item && (
          <div className="mb-4">
            <ControlledBadge category={item.category} portaria344Class={item.portaria344_class} />
          </div>
        )}

        <div className="text-center mb-4">
          <div className="text-xs text-muted-foreground mb-1">Esperado</div>
          <div className="text-2xl font-bold text-foreground">{lot.expected_qty}</div>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={() => setCountValue((v) => Math.max(0, v - 1))}
            className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 active:scale-95 transition-all"
          >
            <Minus className="w-8 h-8" />
          </button>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Contado</div>
            <input
              type="number"
              value={countValue}
              onChange={(e) => setCountValue(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24 text-center text-4xl font-bold bg-transparent text-foreground border-b-2 border-primary focus:outline-none"
            />
          </div>
          <button
            onClick={() => setCountValue((v) => v + 1)}
            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-8 h-8" />
          </button>
        </div>

        {/* Difference indicator */}
        {countValue !== lot.expected_qty && countValue > 0 && (
          <div className={`text-center text-sm font-medium mb-4 ${countValue < lot.expected_qty ? 'text-destructive' : 'text-blue-400'}`}>
            {countValue < lot.expected_qty
              ? `Falta: ${lot.expected_qty - countValue}`
              : `Sobra: ${countValue - lot.expected_qty}`
            }
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity text-lg"
          >
            <Check className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Confirmar'}
          </button>
          {currentIndex < pendingLots.length - 1 && (
            <button
              onClick={() => { setCurrentIndex((i) => i + 1); setCountValue(0) }}
              className="px-4 py-4 rounded-lg bg-muted text-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
