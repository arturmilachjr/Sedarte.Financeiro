import type { ItemCategory } from '@/lib/types'
import { isControlled, isHighVigilance } from '@/lib/constants'

interface Props {
  category: ItemCategory
  portaria344Class?: string | null
  size?: 'sm' | 'md'
}

export function ControlledBadge({ category, portaria344Class, size = 'md' }: Props) {
  if (!isControlled(category)) return null

  const isHV = isHighVigilance(category)
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses} ${
      isHV
        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
    }`}>
      {isHV && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
      {isHV ? 'Alta Vigilância' : 'Controlado'}
      {portaria344Class && ` — ${portaria344Class}`}
    </span>
  )
}
