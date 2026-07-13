/**
 * Standalone push-send endpoint for server-side triggers that aren't a
 * Database Webhook (e.g. a future AI-insight notifier). Requires the
 * shared webhook secret — never call this from the client directly.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendPushToUser } from '../_shared/push.ts'

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')
const JSON_HEADERS = { 'Content-Type': 'application/json' }

// Not browser-facing — no CORS headers, this is called server-to-server only.
Deno.serve(async (req) => {
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADERS })
  }

  const { userId, title, body, data } = await req.json()
  if (!userId || !title || !body) {
    return new Response(JSON.stringify({ error: 'userId, title, and body are required' }), { status: 400, headers: JSON_HEADERS })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const result = await sendPushToUser(supabase, userId, { title, body, data })
  return new Response(JSON.stringify(result), { headers: JSON_HEADERS })
})
