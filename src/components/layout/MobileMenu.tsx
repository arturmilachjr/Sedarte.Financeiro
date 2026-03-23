import { NavLink } from 'react-router-dom'
import { X, Sun, Moon, BarChart3, Settings, Users, LogOut } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  onClose: () => void
}

const menuItems = [
  { label: 'Demonstrativo Mensal', path: '/financeiro/relatorio', icon: BarChart3 },
  { label: 'Conciliação de Estoque', path: '/relatorios/conciliacao', icon: BarChart3 },
  { label: 'Despesas Fixas e Rateio', path: '/configuracoes', icon: Settings },
  { label: 'Usuários', path: '/configuracoes/usuarios', icon: Users },
]

export function MobileMenu({ onClose }: Props) {
  const { theme, toggleTheme } = useTheme()
  const { signOut, user } = useAuth()

  return (
    <div className="fixed inset-0 bg-background/95 z-[60] lg:hidden">
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold">SEDARTE GESTÃO</h2>
            {user && <p className="text-sm text-muted-foreground">{user.name}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-base hover:bg-muted transition-colors"
            >
              <item.icon className="w-5 h-5 text-muted-foreground" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 pt-4 border-t border-border">
          <button
            onClick={() => { toggleTheme(); onClose() }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-base hover:bg-muted transition-colors w-full"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button
            onClick={() => { signOut(); onClose() }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-destructive hover:bg-muted transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}
