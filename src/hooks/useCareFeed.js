import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useCareFeed(circleId) {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!circleId) return
    fetchEntries()

    const channel = supabase
      .channel(`feed:${circleId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'care_feed_entries',
        filter: `circle_id=eq.${circleId}`,
      }, fetchEntries)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [circleId])

  async function fetchEntries() {
    setLoading(true)
    const { data } = await supabase
      .from('care_feed_entries')
      .select('*, profiles(full_name, avatar_url)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(50)

    setEntries(data || [])
    setLoading(false)
  }

  async function addEntry({ category, body }) {
    const { data, error } = await supabase
      .from('care_feed_entries')
      .insert({ circle_id: circleId, author_id: user.id, category, body })
      .select('*, profiles(full_name, avatar_url)')
      .single()

    if (!error && data) {
      setEntries(prev => [data, ...prev])
    }
    return { data, error }
  }

  async function deleteEntry(id) {
    const { error } = await supabase
      .from('care_feed_entries')
      .delete()
      .eq('id', id)
      .eq('author_id', user.id)

    if (!error) {
      setEntries(prev => prev.filter(e => e.id !== id))
    }
    return { error }
  }

  return { entries, loading, addEntry, deleteEntry }
}
