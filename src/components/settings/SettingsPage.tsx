import { Settings } from 'lucide-react'
import { FixedExpensesConfig } from './FixedExpensesConfig'
import { PartnerSharesConfig } from './PartnerSharesConfig'

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6" />
        Configurações
      </h1>
      <FixedExpensesConfig />
      <PartnerSharesConfig />
    </div>
  )
}
