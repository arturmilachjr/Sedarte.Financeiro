import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { FixedExpense } from '@/lib/types'
import { useActivityLog } from './useActivityLog'

export function useFixedExpenses() {
  const [expenses, setExpenses] = useState<FixedExpense[]>([])
  const [loading, setLoading] = useState(true)
  const { log } = useActivityLog()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('fixed_expenses')
      .select('*')
      .eq('is_active', true)
      .order('description')
    setExpenses((data as FixedExpense[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function create(expense: Partial<FixedExpense>) {
    const { data, error } = await supabase
      .from('fixed_expenses')
      .insert(expense)
      .select()
      .single()
    if (error) throw error
    await log('create', 'fixed_expense', data.id, `Despesa fixa criada: ${expense.description}`)
    await fetch()
    return data as FixedExpense
  }

  async function update(id: string, updates: Partial<FixedExpense>) {
    const { error } = await supabase
      .from('fixed_expenses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await log('update', 'fixed_expense', id, `Despesa fixa atualizada`)
    await fetch()
  }

  async function deactivate(id: string) {
    await update(id, { is_active: false })
    await log('deactivate', 'fixed_expense', id, `Despesa fixa desativada`)
  }

  return { expenses, loading, create, update, deactivate, refetch: fetch }
}
