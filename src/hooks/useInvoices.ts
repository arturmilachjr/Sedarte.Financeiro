import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Invoice, InvoiceItem } from '@/lib/types'
import { useActivityLog } from './useActivityLog'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const { log } = useActivityLog()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .order('purchase_date', { ascending: false })
    setInvoices((data as Invoice[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function create(invoice: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert({ ...invoice, is_financial: true })
      .select()
      .single()
    if (error) throw error
    await log('create', 'invoice', data.id, `NF ${invoice.invoice_number} criada — ${invoice.supplier}`)
    await fetch()
    return data as Invoice
  }

  async function update(id: string, updates: Partial<Invoice>) {
    const { error } = await supabase
      .from('invoices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await log('update', 'invoice', id, `NF atualizada`)
    await fetch()
  }

  return { invoices, loading, create, update, refetch: fetch }
}

export function useInvoiceItems(invoiceId: string | null) {
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [loading, setLoading] = useState(false)
  const { log } = useActivityLog()

  const fetch = useCallback(async () => {
    if (!invoiceId) return
    setLoading(true)
    const { data } = await supabase
      .from('invoice_items')
      .select('*, item:items(*)')
      .eq('invoice_id', invoiceId)
    setItems((data as InvoiceItem[]) || [])
    setLoading(false)
  }, [invoiceId])

  useEffect(() => { fetch() }, [fetch])

  async function create(item: Partial<InvoiceItem>) {
    const { data: invoiceItem, error } = await supabase
      .from('invoice_items')
      .insert(item)
      .select()
      .single()
    if (error) throw error

    // Auto-create lot
    const { data: lot } = await supabase
      .from('lots')
      .insert({
        item_id: item.item_id,
        batch: item.batch,
        manufacturer: item.manufacturer,
        manufacturing_date: item.manufacturing_date,
        expiration_date: item.expiration_date,
        expected_qty: item.quantity,
        invoice_id: invoiceId,
        created_by: item.created_by,
      })
      .select()
      .single()

    if (lot) {
      await supabase
        .from('invoice_items')
        .update({ lot_id: lot.id })
        .eq('id', invoiceItem.id)
    }

    await log('create', 'invoice_item', invoiceItem.id, `Item adicionado à NF com lote`)
    await fetch()
    return invoiceItem as InvoiceItem
  }

  return { items, loading, create, refetch: fetch }
}
