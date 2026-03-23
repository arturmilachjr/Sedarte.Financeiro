import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFinancialDocs } from '@/hooks/useFinancialDocs'
import { useFixedExpenses } from '@/hooks/useFixedExpenses'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, ChevronDown, ChevronUp, Link2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCurrentMonth, formatCurrency } from '@/lib/utils'
import { DOC_TYPE_OPTIONS, PAYMENT_METHOD_OPTIONS, PARTNERS } from '@/lib/constants'
import type { Direction, DocType, PaymentMethod } from '@/lib/types'

export function FinancialForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const currentMonth = getCurrentMonth()

  // Main fields (5 visible)
  const [docType, setDocType] = useState<DocType>('comprovante_pgto')
  const [direction, setDirection] = useState<Direction>('saida')
  const [value, setValue] = useState('')
  const [partnerResponsible, setPartnerResponsible] = useState<string>(PARTNERS[0])
  const [file, setFile] = useState<File | null>(null)

  // Detail fields (collapsible)
  const [showDetails, setShowDetails] = useState(false)
  const [description, setDescription] = useState('')
  const [supplierClient, setSupplierClient] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [docDate, setDocDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
  const [referenceMonth, setReferenceMonth] = useState(currentMonth)
  const [fixedExpenseId, setFixedExpenseId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  // Smart suggestion
  const [suggestion, setSuggestion] = useState<{ id: string; description: string; value: number } | null>(null)

  const { create } = useFinancialDocs(referenceMonth)
  const { expenses } = useFixedExpenses()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Smart suggestion: match value to fixed expense
  useEffect(() => {
    if (!value || direction !== 'saida') {
      setSuggestion(null)
      return
    }
    const numValue = parseFloat(value.replace(',', '.'))
    if (isNaN(numValue)) return

    const match = expenses.find((e) => Math.abs(e.value - numValue) < 0.01)
    if (match && !fixedExpenseId) {
      setSuggestion({ id: match.id, description: match.description, value: match.value })
    } else {
      setSuggestion(null)
    }
  }, [value, direction, expenses, fixedExpenseId])

  function acceptSuggestion() {
    if (!suggestion) return
    setFixedExpenseId(suggestion.id)
    setDescription(suggestion.description)
    setSuggestion(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const numValue = parseFloat(value.replace(',', '.'))
    if (isNaN(numValue) || numValue <= 0) {
      setError('Informe um valor válido')
      setSaving(false)
      return
    }

    try {
      await create({
        doc_type: docType,
        direction,
        description: description || DOC_TYPE_OPTIONS.find((o) => o.value === docType)?.label || docType,
        supplier_client: supplierClient || null,
        cnpj: cnpj || null,
        value: numValue,
        payment_method: paymentMethod,
        reference_month: referenceMonth,
        doc_date: docDate || null,
        partner_responsible: partnerResponsible,
        fixed_expense_id: fixedExpenseId,
        notes: notes || null,
        status: 'ok',
        created_by: user?.id,
      })
      navigate('/financeiro')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
      setSaving(false)
    }
  }

  return (
    <div>
      <Link to="/financeiro" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-xl font-bold text-foreground mb-6">Registrar Receita / Despesa</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Doc type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">O que é?</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocType)}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {DOC_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 2. Direction toggle */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Entrou ou saiu?</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDirection('entrada')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                direction === 'entrada'
                  ? 'bg-success text-white'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              💰 Receita
            </button>
            <button
              type="button"
              onClick={() => setDirection('saida')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                direction === 'saida'
                  ? 'bg-destructive text-white'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              💸 Despesa
            </button>
          </div>
        </div>

        {/* 3. Value */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Quanto?</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-card border border-border text-foreground text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0,00"
              required
            />
          </div>
        </div>

        {/* Smart suggestion */}
        {suggestion && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-foreground">
                Vincular a <strong>{suggestion.description}</strong> ({formatCurrency(suggestion.value)})?
              </span>
            </div>
            <button
              type="button"
              onClick={acceptSuggestion}
              className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Vincular
            </button>
          </div>
        )}

        {/* Fixed expense linked indicator */}
        {fixedExpenseId && (
          <div className="p-2 rounded-lg bg-success/10 border border-success/30 text-sm text-success flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Vinculado a despesa fixa: {expenses.find((e) => e.id === fixedExpenseId)?.description}
            <button type="button" onClick={() => setFixedExpenseId(null)} className="ml-auto text-xs hover:underline">remover</button>
          </div>
        )}

        {/* 4. Partner */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Quem pagou/recebeu?</label>
          <select
            value={partnerResponsible}
            onChange={(e) => setPartnerResponsible(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {PARTNERS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* 5. File upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Anexar PDF (opcional)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-primary-foreground file:cursor-pointer"
          />
          {file && <p className="text-xs text-muted-foreground mt-1">{file.name}</p>}
        </div>

        {/* Collapsible details */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Mais detalhes
        </button>

        {showDetails && (
          <div className="space-y-3 p-4 rounded-lg bg-background border border-border">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Fornecedor/Cliente</label>
                <input
                  type="text"
                  value={supplierClient}
                  onChange={(e) => setSupplierClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">CNPJ</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Data do documento</label>
                <input
                  type="date"
                  value={docDate}
                  onChange={(e) => setDocDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Forma de pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Mês de competência</label>
                <input
                  type="month"
                  value={referenceMonth}
                  onChange={(e) => setReferenceMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Despesa fixa</label>
                <select
                  value={fixedExpenseId || ''}
                  onChange={(e) => setFixedExpenseId(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Nenhuma</option>
                  {expenses.map((e) => (
                    <option key={e.id} value={e.id}>{e.description} ({formatCurrency(e.value)})</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Observação</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={2}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-4 rounded-lg bg-primary text-primary-foreground font-medium text-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
