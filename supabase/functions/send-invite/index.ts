/**
 * Triggered by Supabase Database Webhook on invitations INSERT.
 * Also callable directly from the client for immediate sends.
 *
 * Auth:
 *  - Webhook path (body.record): requires x-webhook-secret header matching
 *    the WEBHOOK_SECRET env var (set it in Supabase secrets AND in the
 *    Database Webhook's HTTP headers config).
 *  - Direct path: requires a valid user JWT; the caller must be a member
 *    of the invitation's circle.
 *
 * The destination email is ALWAYS read from the invitations row — a
 * client-supplied email is never trusted (prevents invite-token theft).
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { inviteEmail } from '../_shared/emails.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')
const FROM = 'CareCircle <hello@carecircle.app>'
const APP_URL = Deno.env.get('APP_URL') || 'https://carecircle.app'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-webhook-secret',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const body = await req.json()
  let invitationId: string

  if (body.record) {
    // Database webhook path — authenticate via shared secret
    if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
      return json({ error: 'Unauthorized' }, 401)
    }
    invitationId = body.record.id
  } else {
    // Direct client path — authenticate the user JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    invitationId = body.invitation_id

    // Verify the caller is a member of the invitation's circle
    const { data: invCheck } = await supabase
      .from('invitations')
      .select('circle_id')
      .eq('id', invitationId)
      .single()
    if (!invCheck) return json({ error: 'Invitation not found' }, 404)

    const { data: memberRow } = await supabase
      .from('circle_members')
      .select('circle_id')
      .eq('circle_id', invCheck.circle_id)
      .eq('user_id', user.id)
      .single()
    if (!memberRow) return json({ error: 'Forbidden' }, 403)
  }

  // Fetch full invitation details — email comes from the DB row, never the request
  const { data: inv } = await supabase
    .from('invitations')
    .select(`
      token, email, circle_id, invited_by,
      care_circles ( care_recipients(full_name) )
    `)
    .eq('id', invitationId)
    .single()

  if (!inv) return json({ error: 'Invitation not found' }, 404)

  const { data: inviter } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', inv.invited_by)
    .single()

  const recipientName = (inv.care_circles as any)?.care_recipients?.full_name ?? 'a loved one'
  const inviteUrl = `${APP_URL}/join?token=${inv.token}`

  const { subject, html } = inviteEmail({
    inviterName: inviter?.full_name ?? 'A family member',
    recipientName,
    inviteUrl,
  })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: inv.email, subject, html }),
  })

  const data = await res.json()

  return json({ ok: true, resend: data })
})
