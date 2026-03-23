import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lot } from '@/lib/types'
import { useActivityLog } from './useActivityLog'

export function useLots(filters?: { itemId?: string; invoiceId?: string; pendingOnly?: boolean }) {
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const { log } = useActivityLog()

  const fetch = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('lots')
      .select('*, item:items(*), invoice:invoices(*)')
      .order('expiration_date', { ascending: true })

    if (filters?.itemId) query = query.eq('item_id', filters.itemId)
    if (filters?.invoiceId) query = query.eq('invoice_id', filters.invoiceId)
    if (filters?.pendingOnly) query = query.is('counted_qty', null)

    const { data } = await query
    setLots((data as Lot[]) || [])
    setLoading(false)
  }, [filters?.itemId, filters?.invoiceId, filters?.pendingOnly])

  useEffect(() => { fetch() }, [fetch])

  async function updateCount(id: string, countedQty: number, countedBy: string) {
    const { error } = await supabase
      .from('lots')
      .update({
        counted_qty: countedQty,
        counted_by: countedBy,
        counted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
    if (error) throw error
    await log('count', 'lot', id, `Contagem: ${countedQty} unidades`)
    await fetch()
  }

  return { lots, loading, updateCount, refetch: fetch }
}
