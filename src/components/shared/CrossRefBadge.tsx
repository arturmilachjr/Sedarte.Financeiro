import { Link } from 'react-router-dom'
import { Package, DollarSign, FileText, ClipboardList } from 'lucide-react'

interface Props {
  type: 'stock' | 'financial' | 'invoice' | 'count'
  label: string
  link: string
}

const icons = {
  stock: Package,
  financial: DollarSign,
  invoice: FileText,
  count: ClipboardList,
}

const colors = {
  stock: 'text-blue-400 hover:text-blue-300',
  financial: 'text-green-400 hover:text-green-300',
  invoice: 'text-amber-400 hover:text-amber-300',
  count: 'text-purple-400 hover:text-purple-300',
}

export function CrossRefBadge({ type, label, link }: Props) {
  const Icon = icons[type]

  return (
    <Link
      to={link}
      className={`inline-flex items-center gap-1.5 text-xs ${colors[type]} transition-colors`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Link>
  )
}
