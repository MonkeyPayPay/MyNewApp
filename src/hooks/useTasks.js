import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useTasks(circleId) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!circleId) return
    fetchTasks()

    const channel = supabase
      .channel(`tasks:${circleId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `circle_id=eq.${circleId}`,
      }, fetchTasks)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [circleId])

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*, assigned:assigned_to(full_name), creator:created_by(full_name)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })

    setTasks(data || [])
    setLoading(false)
  }

  async function addTask({ title, priority = 'medium', due_date, assigned_to }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ circle_id: circleId, created_by: user.id, title, priority, due_date, assigned_to })
      .select()
      .single()

    if (!error && data) setTasks(prev => [data, ...prev])
    return { data, error }
  }

  async function toggleTask(id) {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const completed_at = task.completed_at ? null : new Date().toISOString()
    const { error } = await supabase
      .from('tasks')
      .update({ completed_at })
      .eq('id', id)

    if (!error) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed_at } : t))
    }
    return { error }
  }

  async function deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('created_by', user.id)

    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  return { tasks, loading, addTask, toggleTask, deleteTask }
}
