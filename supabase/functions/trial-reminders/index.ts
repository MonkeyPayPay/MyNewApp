/**
 * Trial-ending reminder cron — runs daily.
 * Schedule in Supabase: Dashboard → Edge Functions → trial-reminders → Schedule
 * Cron expression: 0 14 * * *  (once a day, afternoon UTC)
 *
 * Finds subscriptions trialing with 3 days left, sends one reminder each,
 * deduped via notification_log (unique on user_id + type + ref_id) so a
 * user is never emailed twice for the same trial.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { trialEndingEmail } from '../_shared/emails.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')
const FROM = 'CareCircle <hello@carecircle.app>'
const APP_URL = Deno.env.get('APP_URL') || 'https://carecircle.app'
const REMINDER_DAYS_LEFT = 3

const PRICE_BY_TIER: Record<string, string> = { family: '9.99', pro: '24.99' }

Deno.serve(async (req) => {
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const windowStart = new Date(Date.now() + (REMINDER_DAYS_LEFT - 0.5) * 86400000).toISOString()
  const windowEnd   = new Date(Date.now() + (REMINDER_DAYS_LEFT + 0.5) * 86400000).toISOString()

  const { data: trials } = await supabase
    .from('subscriptions')
    .select('id, user_id, tier, current_period_end')
    .eq('status', 'trialing')
    .gte('current_period_end', windowStart)
    .lte('current_period_end', windowEnd)

  if (!trials?.length) return new Response('no trials ending soon', { status: 200 })

  let sent = 0

  for (const sub of trials) {
    const { data: already } = await supabase
      .from('notification_log')
      .select('id')
      .eq('user_id', sub.user_id)
      .eq('type', 'trial_ending')
      .eq('ref_id', sub.id)
      .single()
    if (already) continue

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', sub.user_id)
      .single()

    const { data: authUser } = await supabase.auth.admin.getUserById(sub.user_id)
    const email = authUser?.user?.email
    if (!email) continue

    const daysLeft = Math.max(1, Math.round((new Date(sub.current_period_end).getTime() - Date.now()) / 86400000))

    const { subject, html } = trialEndingEmail({
      userName: profile?.full_name ?? 'there',
      tier: sub.tier,
      daysLeft,
      price: PRICE_BY_TIER[sub.tier] ?? '9.99',
      appUrl: APP_URL,
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject, html }),
    })

    await supabase.from('notification_log').insert({ user_id: sub.user_id, type: 'trial_ending', ref_id: sub.id })
    sent++
  }

  return new Response(JSON.stringify({ sent }), { headers: { 'Content-Type': 'application/json' } })
})
