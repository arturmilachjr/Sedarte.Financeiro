import { useState } from 'react'
import { useItems } from '@/hooks/useItems'
import { Plus, Search, Package } from 'lucide-react'
import { ControlledBadge } from '@/components/shared/ControlledBadge'
import { ITEM_CATEGORY_LABELS, isHighVigilance } from '@/lib/constants'
import type { ItemCategory } from '@/lib/types'
import { ItemForm } from './ItemForm'

export function ItemCatalog() {
  const { items, loading } = useItems()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('')
  const [showForm, setShowForm] = useState(false)

  const filtered = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-6 h-6" />
            Catálogo de Itens
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} itens cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Item</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar item..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
          className="px-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas categorias</option>
          {Object.entries(ITEM_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || categoryFilter ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {isHighVigilance(item.category) && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                  )}
                  <span className="font-medium text-foreground">{item.name}</span>
                  {item.concentration && (
                    <span className="text-sm text-muted-foreground">{item.concentration}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                    {ITEM_CATEGORY_LABELS[item.category]}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.unit}</span>
                  <ControlledBadge
                    category={item.category}
                    portaria344Class={item.portaria344_class}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ItemForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
