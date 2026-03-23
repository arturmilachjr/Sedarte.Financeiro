import { TrendingUp, TrendingDown, Package } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

interface Props {
  totalReceitas: number
  totalDespesas: number
  resultado: number
  receitasByCategory: Record<string, number>
  despesasByCategory: Record<string, number>
}

export function ResultCard({ totalReceitas, totalDespesas, resultado, receitasByCategory, despesasByCategory }: Props) {
  const isPositive = resultado >= 0

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Resultado do Mês
      </h2>

      {/* Receitas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            RECEITAS
          </span>
          <span className="text-sm font-bold text-success">{formatCurrency(totalReceitas)}</span>
        </div>
        {Object.entries(receitasByCategory).map(([cat, value]) => (
          <div key={cat} className="flex items-center justify-between ml-6 text-xs text-muted-foreground">
            <span>{cat}</span>
            <span>{formatCurrency(value)}</span>
          </div>
        ))}
      </div>

      {/* Despesas */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            DESPESAS
          </span>
          <span className="text-sm font-bold text-destructive">{formatCurrency(totalDespesas)}</span>
        </div>
        {Object.entries(despesasByCategory).map(([cat, value]) => (
          <div key={cat} className="flex items-center justify-between ml-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {cat === 'Fornecedores (NFs)' && <Package className="w-3 h-3 text-blue-400" />}
              {cat}
            </span>
            <span>{formatCurrency(value)}</span>
          </div>
        ))}
      </div>

      {/* Resultado */}
      <div className="border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">RESULTADO</span>
          <span className={cn(
            "text-lg font-bold",
            isPositive ? "text-success" : "text-destructive"
          )}>
            {formatCurrency(resultado)} {isPositive ? '✅' : '❌'}
          </span>
        </div>
      </div>
    </div>
  )
}
