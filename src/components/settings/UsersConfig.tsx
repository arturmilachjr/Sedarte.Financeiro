import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useActivityLog } from '@/hooks/useActivityLog'
import { Users, Check, X, UserPlus } from 'lucide-react'
import type { User, AccessRequest } from '@/lib/types'

export function UsersConfig() {
  const { user: currentUser } = useAuth()
  const { log } = useActivityLog()
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [usersRes, reqRes] = await Promise.all([
        supabase.from('users').select('*').order('name'),
        supabase.from('access_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      ])
      setUsers((usersRes.data as User[]) || [])
      setRequests((reqRes.data as AccessRequest[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  async function approveRequest(req: AccessRequest) {
    // Create auth user in Supabase (this would need a server-side function in production)
    // For now, just update the request status
    await supabase
      .from('access_requests')
      .update({ status: 'approved', decided_by: currentUser?.id, decided_at: new Date().toISOString() })
      .eq('id', req.id)

    await log('approve', 'access_request', req.id, `Acesso aprovado para ${req.name}`)
    setRequests(requests.filter((r) => r.id !== req.id))
  }

  async function rejectRequest(req: AccessRequest) {
    await supabase
      .from('access_requests')
      .update({ status: 'rejected', decided_by: currentUser?.id, decided_at: new Date().toISOString() })
      .eq('id', req.id)

    await log('reject', 'access_request', req.id, `Acesso rejeitado para ${req.name}`)
    setRequests(requests.filter((r) => r.id !== req.id))
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Carregando...</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
        <Users className="w-6 h-6" />
        Usuários
      </h1>

      {/* Pending requests */}
      {requests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Solicitações Pendentes ({requests.length})
          </h2>
          <div className="space-y-2">
            {requests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30">
                <div>
                  <div className="text-sm font-medium text-foreground">{req.name}</div>
                  <div className="text-xs text-muted-foreground">{req.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveRequest(req)}
                    className="p-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors"
                    title="Aprovar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rejectRequest(req)}
                    className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                    title="Rejeitar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active users */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Usuários Ativos ({users.filter((u) => u.is_active).length})
      </h2>
      <div className="space-y-2">
        {users.filter((u) => u.is_active).map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
            <div>
              <div className="text-sm font-medium text-foreground">{u.name}</div>
              <div className="text-xs text-muted-foreground">{u.email} — {u.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
