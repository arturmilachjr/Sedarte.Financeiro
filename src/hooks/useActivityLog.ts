import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useActivityLog() {
  const { user } = useAuth()

  async function log(action: string, entity: string, entityId: string | null, description: string | null) {
    await supabase.from('activity_log').insert({
      user_id: user?.id || null,
      user_name: user?.name || null,
      user_email: user?.email || null,
      action,
      entity,
      entity_id: entityId,
      description,
    })
  }

  return { log }
}
