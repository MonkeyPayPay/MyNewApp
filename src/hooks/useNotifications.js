import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const DEFAULTS = {
  email_task_assigned: true,
  email_feed_entry: true,
  email_invite_accepted: true,
  email_expense_added: false,
  email_weekly_digest: true,
}

export function useNotifications() {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setPrefs(data)
        setLoading(false)
      })
  }, [user])

  async function updatePref(key, value) {
    setSaving(true)
    const updated = { ...prefs, [key]: value }
    setPrefs(updated)

    await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...updated, updated_at: new Date().toISOString() })

    setSaving(false)
  }

  return { prefs, loading, saving, updatePref }
}
