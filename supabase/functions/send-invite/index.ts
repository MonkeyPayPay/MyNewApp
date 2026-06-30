/**
 * Triggered by Supabase Database Webhook on invitations INSERT.
 * Also callable directly from the client for immediate sends.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { inviteEmail } from '../_shared/emails.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM = 'CareCircle <hello@carecircle.app>'
const APP_URL = Deno.env.get('APP_URL') || 'https://carecircle.app'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let invitationId: string
  let email: string

  // Handle both direct call and webhook trigger
  const body = await req.json()
  if (body.record) {
    // Database webhook shape
    invitationId = body.record.id
    email = body.record.email
  } else {
    // Direct call from client
    invitationId = body.invitation_id
    email = body.email
  }

  // Fetch full invitation details
  const { data: inv } = await supabase
    .from('invitations')
    .select(`
      token, circle_id, invited_by,
      care_circles ( care_recipients(full_name) )
    `)
    .eq('id', invitationId)
    .single()

  if (!inv) return new Response(JSON.stringify({ error: 'Invitation not found' }), { status: 404 })

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
    body: JSON.stringify({ from: FROM, to: email, subject, html }),
  })

  const data = await res.json()

  return new Response(JSON.stringify({ ok: true, resend: data }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  })
})
