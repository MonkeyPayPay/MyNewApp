/**
 * AI Care Advisor Edge Function
 * POST with { circleId } — returns cached or freshly generated insights.
 * Cache TTL: 24 hours per circle. Requires ANTHROPIC_API_KEY in Supabase secrets.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'
import Anthropic from 'npm:@anthropic-ai/sdk'
import { corsHeaders } from '../_shared/cors.ts'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

Deno.serve(async (req) => {
  const CORS = corsHeaders(req, 'authorization, x-client-info, apikey, content-type')

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401)

    const { circleId } = await req.json()
    if (!circleId) return json({ error: 'circleId required' }, 400)

    // Verify the user is a full-access member of this circle — the
    // scoped professional-caregiver role never sees AI insights
    const { data: memberRow } = await supabase
      .from('circle_members')
      .select('circle_id, role')
      .eq('circle_id', circleId)
      .eq('user_id', user.id)
      .single()

    if (!memberRow || memberRow.role === 'caregiver') return json({ error: 'Forbidden' }, 403)

    // Check cache — return early if still fresh
    const { data: cached } = await supabase
      .from('ai_insights')
      .select('insights, generated_at')
      .eq('circle_id', circleId)
      .single()

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime()
      if (age < CACHE_TTL_MS) {
        return json({ insights: cached.insights, cached: true, generated_at: cached.generated_at })
      }
    }

    // Fetch last 30 days of care data
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [{ data: feedEntries }, { data: tasks }, { data: expenses }, { data: circle }] =
      await Promise.all([
        supabase
          .from('care_feed_entries')
          .select('category, body, created_at, profiles(full_name)')
          .eq('circle_id', circleId)
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('tasks')
          .select('title, priority, completed_at, due_date, assigned_to')
          .eq('circle_id', circleId)
          .gte('created_at', thirtyDaysAgo)
          .limit(30),
        supabase
          .from('expenses')
          .select('amount_cents, category, expense_date')
          .eq('circle_id', circleId)
          .gte('expense_date', thirtyDaysAgo.split('T')[0])
          .limit(30),
        supabase
          .from('care_circles')
          .select('care_recipients(full_name, date_of_birth)')
          .eq('id', circleId)
          .single(),
      ])

    const recipient = (circle as any)?.care_recipients
    const recipientName = recipient?.full_name ?? 'the care recipient'

    const feedSummary = (feedEntries ?? [])
      .map((e: any) => `[${e.category}] ${e.body} (${e.created_at?.split('T')[0]})`)
      .join('\n')

    const taskSummary = (tasks ?? [])
      .map((t: any) => `"${t.title}" — priority: ${t.priority}, completed: ${t.completed_at ? 'yes' : 'no'}, due: ${t.due_date ?? 'none'}`)
      .join('\n')

    const totalExpenses = ((expenses ?? []) as any[]).reduce((s, e) => s + e.amount_cents, 0)
    const expenseSummary = totalExpenses > 0
      ? `Total caregiving expenses in the last 30 days: $${(totalExpenses / 100).toFixed(2)}`
      : 'No expenses logged in the last 30 days.'

    const prompt = `You are an AI care advisor helping a family care team for ${recipientName}. Analyze the following 30-day care data and produce 2–4 actionable insights.

CARE LOG ENTRIES (most recent first):
${feedSummary || 'No entries logged.'}

TASKS:
${taskSummary || 'No tasks logged.'}

EXPENSES:
${expenseSummary}

Return a JSON array of insights. Each insight must have exactly these fields:
- severity: "high" | "medium" | "low"
- icon: a single relevant emoji
- title: short headline (under 10 words)
- body: 1–3 sentence explanation citing specific patterns from the data
- action: a concrete next-step button label (under 6 words)
- tag: short label like "High Priority", "Medication", "Positive Trend", "Coordination", etc.

Respond with ONLY the JSON array — no markdown fences, no commentary.`

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    })

    // Extract the text block (thinking blocks come first, then text)
    const textBlock = message.content.find((b: any) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text in Claude response')
    }

    let insights: unknown[]
    try {
      insights = JSON.parse(textBlock.text)
      if (!Array.isArray(insights)) throw new Error('Not an array')
    } catch {
      throw new Error(`Failed to parse Claude output: ${textBlock.text.slice(0, 200)}`)
    }

    const now = new Date().toISOString()

    // Upsert into cache
    await supabase
      .from('ai_insights')
      .upsert({ circle_id: circleId, insights, generated_at: now })

    return json({ insights, cached: false, generated_at: now })
  } catch (err: any) {
    console.error('ai-care-advisor error:', err)
    return json({ error: err.message ?? 'Internal error' }, 500)
  }
})

