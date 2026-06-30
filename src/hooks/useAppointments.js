import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAppointments(circleId) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    if (!circleId) { setLoading(false); return }
    fetch()

    const channel = supabase
      .channel(`appointments:${circleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `circle_id=eq.${circleId}` }, fetch)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [circleId])

  async function fetch() {
    const { data, error } = await supabase
      .from('appointments')
      .select('*, profiles:created_by(full_name)')
      .eq('circle_id', circleId)
      .order('starts_at', { ascending: true })
    if (!error) setAppointments(data ?? [])
    setLoading(false)
  }

  async function addAppointment(fields) {
    const { error } = await supabase
      .from('appointments')
      .insert({ ...fields, circle_id: circleId })
    if (!error) await fetch()
    return { error }
  }

  async function deleteAppointment(id) {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (!error) setAppointments(prev => prev.filter(a => a.id !== id))
    return { error }
  }

  return { appointments, loading, addAppointment, deleteAppointment }
}
