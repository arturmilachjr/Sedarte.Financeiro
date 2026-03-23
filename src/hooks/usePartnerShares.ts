import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PartnerShare } from '@/lib/types'
import { useActivityLog } from './useActivityLog'

export function usePartnerShares(month?: string) {
  const [shares, setShares] = useState<PartnerShare[]>([])
  const [loading, setLoading] = useState(true)
  const { log } = useActivityLog()

  const fetch = useCallback(async () => {
    setLoading(true)
    // Get the most recent shares effective at or before the given month
    const targetMonth = month || new Date().toISOString().slice(0, 7)

    const { data } = await supabase
      .from('partner_shares')
      .select('*')
      .lte('effective_from', targetMonth)
      .order('effective_from', { ascending: false })

    // Get only the latest share per partner
    const latestByPartner = new Map<string, PartnerShare>()
    for (const share of (data as PartnerShare[]) || []) {
      if (!latestByPartner.has(share.partner_name)) {
        latestByPartner.set(share.partner_name, share)
      }
    }
    setShares(Array.from(latestByPartner.values()))
    setLoading(false)
  }, [month])

  useEffect(() => { fetch() }, [fetch])

  async function createShares(sharesData: { partner_name: string; share_pct: number; effective_from: string; created_by?: string }[]) {
    const { error } = await supabase.from('partner_shares').insert(sharesData)
    if (error) throw error
    await log('create', 'partner_shares', null, `Rateio atualizado a partir de ${sharesData[0]?.effective_from}`)
    await fetch()
  }

  return { shares, loading, createShares, refetch: fetch }
}
