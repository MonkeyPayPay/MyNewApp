import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function matchesToday(template) {
  if (template.frequency === 'daily') return true
  const dow = new Date().getDay()
  return (template.days_of_week ?? []).includes(dow)
}

export function useRecurringTasks(circleId) {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!circleId) { setLoading(false); return }
    fetchTemplates()
  }, [circleId])

  async function fetchTemplates() {
    setLoading(true)
    const { data, error } = await supabase
      .from('recurring_tasks')
      .select('*, assigned:assigned_to(full_name)')
      .eq('circle_id', circleId)
      .eq('active', true)
      .order('created_at', { ascending: false })
    if (!error) setTemplates(data ?? [])
    setLoading(false)
  }

  /**
   * Creates the template, then immediately materializes today's task if
   * the schedule matches today — otherwise a caregiver setting up a
   * "every morning" medication reminder would see nothing until
   * tomorrow's cron run, which reads as broken.
   */
  async function addRecurringTask({ title, priority = 'medium', assigned_to, frequency, days_of_week }) {
    const { data: template, error } = await supabase
      .from('recurring_tasks')
      .insert({
        circle_id: circleId,
        created_by: user.id,
        assigned_to: assigned_to || null,
        title,
        priority,
        frequency,
        days_of_week: frequency === 'weekly' ? days_of_week : null,
      })
      .select()
      .single()

    if (error) return { error }
    setTemplates(prev => [template, ...prev])

    if (matchesToday(template)) {
      await supabase.from('tasks').insert({
        circle_id: circleId,
        created_by: user.id,
        assigned_to: template.assigned_to,
        title: template.title,
        priority: template.priority,
        due_date: new Date().toISOString().split('T')[0],
        recurring_task_id: template.id,
      })
      // Realtime subscription on tasks (useTasks) picks this up on its own
    }

    return { data: template, error: null }
  }

  async function stopRecurringTask(id) {
    const { error } = await supabase.from('recurring_tasks').update({ active: false }).eq('id', id)
    if (!error) setTemplates(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  return { templates, loading, addRecurringTask, stopRecurringTask }
}
