/**
 * Triggered by Supabase Database Webhooks on:
 *   - tasks INSERT         → notify assignee
 *   - care_feed_entries INSERT → notify all other circle members
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { taskAssignedEmail, feedEntryEmail } from '../_shared/emails.ts'
import { sendPushToUser } from '../_shared/push.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM = 'CareCircle <hello@carecircle.app>'
const APP_URL = Deno.env.get('APP_URL') || 'https://carecircle.app'

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  return res.json()
}

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

Deno.serve(async (req) => {
  // Only Database Webhooks (configured with the x-webhook-secret header)
  // may invoke this — otherwise anyone with the anon key can trigger
  // arbitrary emails from CareCircle's sender address.
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await req.json()
  const { type, table, record } = payload  // Supabase webhook shape

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── Task assigned ─────────────────────────────────────
  if (table === 'tasks' && type === 'INSERT' && record.assigned_to) {
    // Dedup check
    const { data: already } = await supabase
      .from('notification_log')
      .select('id')
      .eq('user_id', record.assigned_to)
      .eq('type', 'task_assigned')
      .eq('ref_id', record.id)
      .single()
    if (already) return new Response('duplicate', { status: 200 })

    const { data: assignee } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', record.assigned_to)
      .single()

    const { data: assigner } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', record.created_by)
      .single()

    // Get care recipient name via circle
    const { data: circle } = await supabase
      .from('care_circles')
      .select('care_recipients(full_name)')
      .eq('id', record.circle_id)
      .single()

    const recipientName = (circle?.care_recipients as any)?.full_name ?? 'your loved one'

    // Email — gated by the user's email preference
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('email_task_assigned')
      .eq('user_id', record.assigned_to)
      .single()

    if (prefs?.email_task_assigned) {
      const { data: assigneeAuth } = await supabase.auth.admin.getUserById(record.assigned_to)
      const email = assigneeAuth?.user?.email
      if (email) {
        const { subject, html } = taskAssignedEmail({
          assigneeName: assignee?.full_name ?? 'there',
          assignerName: assigner?.full_name ?? 'A family member',
          taskTitle: record.title,
          priority: record.priority,
          dueDate: record.due_date,
          recipientName,
          appUrl: APP_URL,
        })
        await sendEmail(email, subject, html)
      }
    }

    // Push — a separate channel from the email preference above; fires
    // whenever a device is registered, independent of email opt-out
    await sendPushToUser(supabase, record.assigned_to, {
      title: 'New task assigned',
      body: `${assigner?.full_name ?? 'Someone'} assigned you: ${record.title}`,
      data: { nav: 'tasks' },
    })

    // Log to prevent duplicates
    await supabase.from('notification_log').insert({
      user_id: record.assigned_to,
      type: 'task_assigned',
      ref_id: record.id,
    })
  }

  // ── Care feed entry ───────────────────────────────────
  if (table === 'care_feed_entries' && type === 'INSERT') {
    // Get all circle members except the author
    const { data: members } = await supabase
      .from('circle_members')
      .select('user_id')
      .eq('circle_id', record.circle_id)
      .neq('user_id', record.author_id)

    if (!members?.length) return new Response('no members', { status: 200 })

    const { data: author } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', record.author_id)
      .single()

    const { data: circle } = await supabase
      .from('care_circles')
      .select('care_recipients(full_name)')
      .eq('id', record.circle_id)
      .single()

    for (const member of members) {
      // Dedup check
      const { data: already } = await supabase
        .from('notification_log')
        .select('id')
        .eq('user_id', member.user_id)
        .eq('type', 'feed_entry')
        .eq('ref_id', record.id)
        .single()
      if (already) continue

      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('email_feed_entry')
        .eq('user_id', member.user_id)
        .single()

      if (prefs?.email_feed_entry) {
        const { data: memberAuth } = await supabase.auth.admin.getUserById(member.user_id)
        const email = memberAuth?.user?.email
        if (email) {
          const { subject, html } = feedEntryEmail({
            recipientName: (circle?.care_recipients as any)?.full_name ?? 'your loved one',
            authorName: author?.full_name ?? 'A family member',
            category: record.category,
            body: record.body,
            appUrl: APP_URL,
          })
          await sendEmail(email, subject, html)
        }
      }

      await sendPushToUser(supabase, member.user_id, {
        title: 'New care log update',
        body: `${author?.full_name ?? 'Someone'}: ${record.body.slice(0, 80)}`,
        data: { nav: 'feed' },
      })

      await supabase.from('notification_log').insert({
        user_id: member.user_id,
        type: 'feed_entry',
        ref_id: record.id,
      })
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
