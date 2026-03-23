import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/components/auth/LoginPage'
import { AccessRequest } from '@/components/auth/AccessRequest'
import { ChangePassword } from '@/components/auth/ChangePassword'
import { Dashboard } from '@/components/financial/Dashboard'
import { FinancialForm } from '@/components/financial/FinancialForm'
import { ItemCatalog } from '@/components/inventory/ItemCatalog'
import { LotsList } from '@/components/inventory/LotsList'
import { InvoiceList } from '@/components/invoices/InvoiceList'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import { InvoiceDetail } from '@/components/invoices/InvoiceDetail'
import { CountByItem } from '@/components/counting/CountByItem'
import { PendingLots } from '@/components/counting/PendingLots'
import { MonthlyReport } from '@/components/reports/MonthlyReport'
import { StockReconciliation } from '@/components/reports/StockReconciliation'
import { SettingsPage } from '@/components/settings/SettingsPage'
import { UsersConfig } from '@/components/settings/UsersConfig'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/solicitar-acesso" element={<AccessRequest />} />
      <Route path="/alterar-senha" element={
        <ProtectedRoute><ChangePassword /></ProtectedRoute>
      } />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute><AppLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/financeiro" replace />} />

        {/* Financial */}
        <Route path="financeiro" element={<Dashboard />} />
        <Route path="financeiro/registrar" element={<FinancialForm />} />
        <Route path="financeiro/relatorio" element={<MonthlyReport />} />

        {/* Inventory */}
        <Route path="estoque" element={<ItemCatalog />} />
        <Route path="estoque/lotes" element={<LotsList />} />

        {/* Invoices */}
        <Route path="notas-fiscais" element={<InvoiceList />} />
        <Route path="notas-fiscais/nova" element={<InvoiceForm />} />
        <Route path="notas-fiscais/:id" element={<InvoiceDetail />} />

        {/* Physical Count */}
        <Route path="contagem" element={<CountByItem />} />
        <Route path="contagem/pendentes" element={<PendingLots />} />

        {/* Reports */}
        <Route path="relatorios/conciliacao" element={<StockReconciliation />} />

        {/* Settings */}
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="configuracoes/usuarios" element={<UsersConfig />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/financeiro" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
