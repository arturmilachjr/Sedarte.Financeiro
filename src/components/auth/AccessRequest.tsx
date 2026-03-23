import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Link } from 'react-router-dom'
import { UserPlus, ArrowLeft } from 'lucide-react'

export function AccessRequest() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase
      .from('access_requests')
      .insert({ name, email, cpf: cpf.replace(/\D/g, ''), status: 'pending' })

    if (err) {
      setError('Erro ao enviar solicitação. Tente novamente.')
      setLoading(false)
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Solicitação enviada</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Aguarde a aprovação do administrador. Você receberá acesso assim que for aprovado.
          </p>
          <Link to="/login" className="text-primary hover:underline text-sm">
            Voltar ao login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Link to="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>

        <h2 className="text-xl font-bold text-foreground mb-6">Solicitar Acesso</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="000.000.000-00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <UserPlus className="w-5 h-5" />
            {loading ? 'Enviando...' : 'Solicitar Acesso'}
          </button>
        </form>
      </div>
    </div>
  )
}
