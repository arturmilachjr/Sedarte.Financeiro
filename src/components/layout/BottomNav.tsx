import { NavLink } from 'react-router-dom'
import { DollarSign, Package, FileText, ClipboardList, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { MobileMenu } from './MobileMenu'

const tabs = [
  { label: 'Financeiro', icon: DollarSign, path: '/financeiro' },
  { label: 'Estoque', icon: Package, path: '/estoque' },
  { label: 'NFs', icon: FileText, path: '/notas-fiscais' },
  { label: 'Contagem', icon: ClipboardList, path: '/contagem' },
]

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-16 px-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs transition-colors',
                  isActive
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                )
              }
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </NavLink>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs text-muted-foreground"
          >
            <Menu className="w-5 h-5" />
            Menu
          </button>
        </div>
      </nav>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  )
}
