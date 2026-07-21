import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function useVitals(circleId) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!circleId) { setLoading(false); return }
    fetchToday()

    const channel = supabase
      .channel(`vitals:${circleId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'vitals',
        filter: `circle_id=eq.${circleId}`,
      }, fetchToday)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [circleId])

  async function fetchToday() {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('circle_id', circleId)
      .gte('logged_at', startOfToday())
      .order('logged_at', { ascending: false })
    if (!error) setEntries(data ?? [])
    setLoading(false)
  }

  async function log(kind, value, valueSecondary = null) {
    if (!circleId || !user) return { error: new Error('Missing circle or user') }
    const { error } = await supabase.from('vitals').insert({
      circle_id: circleId,
      logged_by: user.id,
      kind,
      value,
      value_secondary: valueSecondary,
    })
    return { error }
  }

  const today = useMemo(() => {
    const latestMood  = entries.find(e => e.kind === 'mood')
    const latestBp     = entries.find(e => e.kind === 'blood_pressure')
    const latestPain   = entries.find(e => e.kind === 'pain')
    const waterGlasses = entries.filter(e => e.kind === 'water').length

    return { latestMood, latestBp, latestPain, waterGlasses }
  }, [entries])

  return { entries, today, loading, log }
}
