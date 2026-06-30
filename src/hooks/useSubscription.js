import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export const TIERS = {
  free: { label: 'Free', rank: 0 },
  family: { label: 'Family', rank: 1 },
  pro: { label: 'Pro', rank: 2 },
}

export function useSubscription() {
  const { user, session } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchSubscription()

    const channel = supabase
      .channel(`sub:${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, fetchSubscription)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user])

  async function fetchSubscription() {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setSubscription(data ?? { tier: 'free', status: 'active' })
    setLoading(false)
  }

  async function startCheckout(tier, interval = 'monthly') {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { tier, interval },
    })
    if (error) throw error
    if (data.url) window.location.href = data.url
  }

  async function openPortal() {
    const { data, error } = await supabase.functions.invoke('create-portal-session', {})
    if (error) throw error
    if (data.url) window.open(data.url, '_blank')
  }

  const tier = subscription?.tier ?? 'free'
  const isActive = ['active', 'trialing'].includes(subscription?.status ?? 'active')

  const can = (feature) => {
    const tierRank = TIERS[tier]?.rank ?? 0
    const gates = {
      documents:          tierRank >= 1,  // family+
      expenses:           tierRank >= 1,
      ai_advisor:         tierRank >= 1,
      unlimited_members:  tierRank >= 1,
      professional_carer: tierRank >= 2,  // pro only
      hipaa:              tierRank >= 2,
    }
    return isActive && (gates[feature] ?? true)
  }

  return { subscription, tier, loading, can, startCheckout, openPortal }
}
