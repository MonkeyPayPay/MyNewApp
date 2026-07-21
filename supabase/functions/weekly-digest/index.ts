/**
 * Weekly digest cron — runs every Monday at 9 AM.
 * Schedule in Supabase: Dashboard → Edge Functions → Schedule
 * Cron expression: 0 9 * * 1
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { weeklyDigestEmail } from '../_shared/emails.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')
const FROM = 'CareCircle <hello@carecircle.app>'
const APP_URL = Deno.env.get('APP_URL') || 'https://carecircle.app'

Deno.serve(async (req) => {
  // Only the scheduler (configured with the x-webhook-secret header) may
  // invoke this — otherwise anyone can spam every subscriber with digests.
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const weekOf = new Date(weekAgo).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Get all users who want a weekly digest
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('email_weekly_digest', true)

  if (!prefs?.length) return new Response('no users', { status: 200 })

  let sent = 0

  for (const { user_id } of prefs) {
    // Find their circle
    const { data: memberRow } = await supabase
      .from('circle_members')
      .select('circle_id, care_circles(care_recipients(full_name))')
      .eq('user_id', user_id)
      .limit(1)
      .single()

    if (!memberRow) continue

    const circleId = memberRow.circle_id
    const recipientName = (memberRow.care_circles as any)?.care_recipients?.full_name ?? 'your loved one'

    // Tasks this week
    const { data: tasksCompleted } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('circle_id', circleId)
      .gte('completed_at', weekAgo)

    const { data: tasksPending } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('circle_id', circleId)
      .is('completed_at', null)

    // Feed entries this week
    const { data: feedEntries, count: feedCount } = await supabase
      .from('care_feed_entries')
      .select('category, body, author_id, profiles(full_name)')
      .eq('circle_id', circleId)
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false })
      .limit(3)

    // Expenses this week
    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount_cents')
      .eq('circle_id', circleId)
      .gte('expense_date', weekAgo.split('T')[0])

    const totalCents = expenses?.reduce((s, e) => s + e.amount_cents, 0) ?? 0
    const totalExpenses = totalCents > 0 ? `$${(totalCents / 100).toFixed(2)}` : '$0'

    // Get user email
    const { data: userAuth } = await supabase.auth.admin.getUserById(user_id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user_id)
      .single()

    const email = userAuth?.user?.email
    if (!email) continue

    const topEntries = (feedEntries ?? []).map((e: any) => ({
      category: e.category,
      body: e.body,
      author: e.profiles?.full_name ?? 'A family member',
    }))

    const { subject, html } = weeklyDigestEmail({
      userName: profile?.full_name ?? 'there',
      recipientName,
      weekOf,
      tasksCompleted: (tasksCompleted as any)?.length ?? 0,
      tasksPending:   (tasksPending as any)?.length ?? 0,
      feedEntries:    feedCount ?? 0,
      totalExpenses,
      topEntries,
      appUrl: APP_URL,
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: email, subject, html }),
    })

    sent++
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
