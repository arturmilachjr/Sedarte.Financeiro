import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthLabel, prevMonth, nextMonth } from '@/lib/utils'

interface Props {
  month: string
  onChange: (month: string) => void
}

export function MonthSelector({ month, onChange }: Props) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onChange(prevMonth(month))}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-lg font-semibold text-foreground min-w-[100px] text-center">
        {formatMonthLabel(month)}
      </span>
      <button
        onClick={() => onChange(nextMonth(month))}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
