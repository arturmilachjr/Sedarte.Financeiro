import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Item } from '@/lib/types'
import { useActivityLog } from './useActivityLog'

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const { log } = useActivityLog()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('items')
      .select('*')
      .order('name')
    setItems((data as Item[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function create(item: Partial<Item>) {
    const { data, error } = await supabase.from('items').insert(item).select().single()
    if (error) throw error
    await log('create', 'item', data.id, `Item criado: ${item.name}`)
    await fetch()
    return data as Item
  }

  async function update(id: string, updates: Partial<Item>) {
    const { error } = await supabase.from('items').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    await log('update', 'item', id, `Item atualizado: ${updates.name || id}`)
    await fetch()
  }

  return { items, loading, create, update, refetch: fetch }
}
