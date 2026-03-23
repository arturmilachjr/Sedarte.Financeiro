import { NavLink } from 'react-router-dom'
import {
  DollarSign, Package, FileText, ClipboardList,
  BarChart3, Settings, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Financeiro',
    icon: DollarSign,
    children: [
      { label: 'Dashboard', path: '/financeiro' },
      { label: 'Registrar Receita/Despesa', path: '/financeiro/registrar' },
    ],
  },
  {
    label: 'Estoque',
    icon: Package,
    children: [
      { label: 'Catálogo de Itens', path: '/estoque' },
      { label: 'Lotes', path: '/estoque/lotes' },
    ],
  },
  {
    label: 'Notas Fiscais',
    icon: FileText,
    children: [
      { label: 'Lista de NFs', path: '/notas-fiscais' },
      { label: 'Registrar Nova NF', path: '/notas-fiscais/nova' },
    ],
  },
  {
    label: 'Contagem Física',
    icon: ClipboardList,
    children: [
      { label: 'Por Item', path: '/contagem' },
      { label: 'Lotes Pendentes', path: '/contagem/pendentes' },
    ],
  },
  {
    label: 'Relatórios',
    icon: BarChart3,
    children: [
      { label: 'Conciliação de Estoque', path: '/relatorios/conciliacao' },
      { label: 'Demonstrativo Mensal', path: '/financeiro/relatorio' },
    ],
  },
  {
    label: 'Configurações',
    icon: Settings,
    children: [
      { label: 'Despesas Fixas e Rateio', path: '/configuracoes' },
      { label: 'Usuários', path: '/configuracoes/usuarios' },
    ],
  },
]

export function Sidebar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-foreground tracking-tight">SEDARTE GESTÃO</h1>
        <p className="text-xs text-muted-foreground mt-1">Anestesia Móvel Ltda.</p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              <group.icon className="w-4 h-4" />
              {group.label}
            </div>
            {group.children.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/financeiro' || item.path === '/estoque' || item.path === '/notas-fiscais' || item.path === '/contagem' || item.path === '/configuracoes'}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
      </button>
    </aside>
  )
}
