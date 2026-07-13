import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { track } from '../lib/analytics'
import { TIERS, canAccess } from '../lib/entitlements'

export { TIERS }

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
    track('checkout_started', { tier, interval })
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
  const can = (feature) => canAccess(tier, subscription?.status, feature)

  const isTrialing = subscription?.status === 'trialing'
  const trialDaysLeft = isTrialing && subscription?.current_period_end
    ? Math.max(0, Math.ceil((new Date(subscription.current_period_end).getTime() - Date.now()) / 86400000))
    : null

  return { subscription, tier, isTrialing, trialDaysLeft, loading, can, startCheckout, openPortal }
}
