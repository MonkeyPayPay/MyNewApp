/**
 * Summarizes an uploaded document using Claude's vision/document API.
 * Called from the client immediately after a document is uploaded.
 * Supports PDF and image files.
 *
 * Auth: requires a valid user JWT; the caller must be a member of the
 * circle that owns the document. The anon key alone is rejected.
 */
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Content-Type': 'application/json',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })

  const { data: { user }, error: authErr } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS })

  const { documentId } = await req.json()
  if (!documentId) return new Response(JSON.stringify({ error: 'documentId required' }), { status: 400, headers: CORS })

  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (docErr || !doc) return new Response(JSON.stringify({ error: 'Document not found' }), { status: 404, headers: CORS })

  // Verify the caller belongs to the circle that owns this document
  const { data: memberRow } = await supabase
    .from('circle_members')
    .select('circle_id')
    .eq('circle_id', doc.circle_id)
    .eq('user_id', user.id)
    .single()

  if (!memberRow) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: CORS })

  // Skip if already summarized
  if (doc.ai_summary) return new Response(JSON.stringify({ summary: doc.ai_summary, cached: true }), { headers: CORS })

  const isImage = doc.mime_type?.startsWith('image/')
  const isPdf   = doc.mime_type === 'application/pdf'

  let summary: string

  if (isImage || isPdf) {
    // Fetch file bytes via signed URL
    const { data: { signedUrl }, error: urlErr } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60)

    if (urlErr || !signedUrl) {
      return new Response(JSON.stringify({ error: 'Could not access file' }), { status: 500, headers: CORS })
    }

    const fileRes = await fetch(signedUrl)
    const buffer  = await fileRes.arrayBuffer()
    // Convert to base64 without TextDecoder (binary safe)
    const bytes  = new Uint8Array(buffer)
    let binary   = ''
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    const base64 = btoa(binary)

    const contentBlock = isImage
      ? { type: 'image',    source: { type: 'base64', media_type: doc.mime_type, data: base64 } }
      : { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          contentBlock as any,
          {
            type: 'text',
            text: 'This is a caregiving document. In 1–2 sentences, describe what this document is and what key information it contains. Be specific and useful for a family caregiver. No disclaimers.',
          },
        ],
      }],
    })

    summary = (message.content.find(b => b.type === 'text') as any)?.text ?? `${doc.name}`
  } else {
    summary = `${doc.name} — stored securely in your document vault.`
  }

  await supabase.from('documents').update({ ai_summary: summary }).eq('id', documentId)

  return new Response(JSON.stringify({ summary }), { headers: CORS })
})
