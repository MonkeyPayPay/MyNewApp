import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useCircle } from './useCircle'

export function useAIAdvisor(enabled = true) {
  const { user } = useAuth()
  const { circle } = useCircle()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [generatedAt, setGeneratedAt] = useState(null)
  const [cached, setCached] = useState(false)

  const fetchInsights = useCallback(async (force = false) => {
    if (!user || !circle?.id) return
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await supabase.functions.invoke('ai-care-advisor', {
        body: { circleId: circle.id, force },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      if (res.error) throw new Error(res.error.message)
      setInsights(res.data.insights)
      setGeneratedAt(res.data.generated_at)
      setCached(res.data.cached)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, circle?.id])

  useEffect(() => {
    // `enabled` lets callers skip the fetch entirely for users who aren't
    // entitled to this feature — otherwise every home-screen load would
    // silently trigger a paid AI generation call for free-tier users too.
    if (enabled && circle?.id) fetchInsights()
  }, [enabled, circle?.id, fetchInsights])

  return { insights, loading, error, generatedAt, cached, refresh: () => fetchInsights(true) }
}
