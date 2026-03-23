import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DollarSign, Plus, Download } from 'lucide-react'
import { getCurrentMonth } from '@/lib/utils'
import { useFinancialSummary } from '@/hooks/useFinancialSummary'
import { usePartnerShares } from '@/hooks/usePartnerShares'
import { useFinancialDocs } from '@/hooks/useFinancialDocs'
import { MonthSelector } from './MonthSelector'
import { ResultCard } from './ResultCard'
import { FixedExpensesList } from './FixedExpensesList'
import { PartnerSplit } from './PartnerSplit'

export function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonth())
  const { summary, loading } = useFinancialSummary(month)
  const { shares } = usePartnerShares(month)
  const { docs } = useFinancialDocs(month)

  const totalDespesasFixas = summary.fixedExpenseStatuses.reduce(
    (sum, s) => sum + s.expense.value,
    0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-foreground" />
          <h1 className="text-xl font-bold text-foreground">Financeiro</h1>
        </div>
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : (
        <div className="space-y-4">
          <ResultCard
            totalReceitas={summary.totalReceitas}
            totalDespesas={summary.totalDespesas}
            resultado={summary.resultado}
            receitasByCategory={summary.receitasByCategory}
            despesasByCategory={summary.despesasByCategory}
          />

          <FixedExpensesList statuses={summary.fixedExpenseStatuses} />

          <PartnerSplit
            shares={shares}
            totalDespesasFixas={totalDespesasFixas}
            docs={docs}
          />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/financeiro/registrar"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Registrar receita/despesa
            </Link>
            <Link
              to={`/financeiro/relatorio?month=${month}`}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-5 h-5" />
              Exportar demonstrativo
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
