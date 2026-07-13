import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useExpenses(circleId) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!circleId) return
    fetchExpenses()

    const channel = supabase
      .channel(`expenses:${circleId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'expenses',
        filter: `circle_id=eq.${circleId}`,
      }, fetchExpenses)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [circleId])

  async function fetchExpenses() {
    setLoading(true)
    const { data } = await supabase
      .from('expenses')
      .select('*, payer:paid_by(full_name, avatar_url), receipt:receipt_document_id(id, name, file_path, mime_type)')
      .eq('circle_id', circleId)
      .order('expense_date', { ascending: false })
      .limit(100)

    setExpenses(data || [])
    setLoading(false)
  }

  async function addExpense({ label, amount, category, expense_date, receipt_document_id }) {
    const amount_cents = Math.round(parseFloat(amount) * 100)
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        circle_id: circleId,
        paid_by: user.id,
        label,
        amount_cents,
        category,
        expense_date: expense_date || new Date().toISOString().split('T')[0],
        receipt_document_id: receipt_document_id ?? null,
      })
      .select('*, payer:paid_by(full_name, avatar_url), receipt:receipt_document_id(id, name, file_path, mime_type)')
      .single()

    if (!error && data) setExpenses(prev => [data, ...prev])
    return { data, error }
  }

  async function deleteExpense(id) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('paid_by', user.id)

    if (!error) setExpenses(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  const totalCents = expenses.reduce((sum, e) => sum + e.amount_cents, 0)

  return { expenses, loading, totalCents, addExpense, deleteExpense, refetch: fetchExpenses }
}
