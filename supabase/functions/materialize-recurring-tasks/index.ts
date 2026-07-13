/**
 * Materializes today's occurrence of every active recurring task.
 * Cron: schedule daily, early morning local-ish time.
 * Schedule in Supabase: Dashboard → Edge Functions → materialize-recurring-tasks
 *   → Schedule, cron `0 6 * * *`
 *
 * Idempotent: relies on the unique index on (recurring_task_id, due_date)
 * in supabase/recurring_tasks.sql — a retried run just hits a conflict
 * and skips, never double-creating today's task.
 */
import { createClient } from 'npm:@supabase/supabase-js@2'

const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')

Deno.serve(async (req) => {
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const today = new Date().toISOString().split('T')[0]
  const todayDow = new Date().getDay() // 0=Sunday..6=Saturday

  const { data: templates, error } = await supabase
    .from('recurring_tasks')
    .select('*')
    .eq('active', true)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  if (!templates?.length) return new Response(JSON.stringify({ created: 0 }), { headers: { 'Content-Type': 'application/json' } })

  const due = templates.filter(t =>
    t.frequency === 'daily' || (t.frequency === 'weekly' && (t.days_of_week ?? []).includes(todayDow))
  )

  let created = 0
  for (const template of due) {
    const { error: insertErr } = await supabase.from('tasks').insert({
      circle_id: template.circle_id,
      created_by: template.created_by,
      assigned_to: template.assigned_to,
      title: template.title,
      priority: template.priority,
      due_date: today,
      recurring_task_id: template.id,
    })
    // A unique-violation here just means today's occurrence already exists
    // (retried cron run) — that's success, not a failure to report.
    if (!insertErr) created++
  }

  return new Response(JSON.stringify({ created, checked: due.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
