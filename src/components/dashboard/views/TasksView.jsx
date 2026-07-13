import { useState } from 'react'
import { ClipboardList, Plus, CheckCircle, Clock, X, Trash2, Loader, Repeat } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useRecurringTasks } from '../../../hooks/useRecurringTasks'
import { PRIORITY_COLORS, WEEKDAY_LABELS } from '../dashboardConstants'
import { fmtDate } from '../../../lib/dateFormat'

// ── TasksView ─────────────────────────────────────────────────────────────────

export default function TasksView({ circleId, tasks, loading, addTask, toggleTask, deleteTask, members }) {
  const { user }    = useAuth()
  const { templates, addRecurringTask, stopRecurringTask } = useRecurringTasks(circleId)
  const [showModal, setShowModal] = useState(false)
  const pending   = tasks.filter(t => !t.completed_at)
  const completed = tasks.filter(t => t.completed_at)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Task Board</h2>
          <p className="text-slate-500 text-sm">{pending.length} pending · {completed.length} completed</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {loading && [1,2,3].map(n => <div key={n} className="glass rounded-2xl p-4 h-20 mb-3 animate-pulse" />)}

      {!loading && tasks.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center border border-white/5">
          <ClipboardList className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No tasks yet</p>
          <p className="text-slate-500 text-sm mb-5">Create tasks and assign them to family members.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Create the first task →</button>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {pending.map((task) => (
          <div key={task.id} className="glass rounded-2xl p-4 flex items-start gap-4 card-hover group">
            <button onClick={() => toggleTask(task.id)} className="w-5 h-5 rounded-full border-2 border-slate-600 hover:border-emerald-500 flex items-center justify-center flex-shrink-0 mt-1 transition-all" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium flex items-center gap-2">
                {task.title}
                {task.recurring_task_id && <Repeat className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" aria-label="Recurring task" />}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium}`}>{task.priority} priority</span>
                {task.due_date && <span className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtDate(task.due_date)}</span>}
                <span className="text-slate-500 text-xs">{task.assigned?.full_name ?? 'Unassigned'}</span>
              </div>
            </div>
            {task.created_by === user?.id && (
              <button onClick={() => deleteTask(task.id)} className="text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <>
          <h3 className="text-slate-600 text-xs uppercase tracking-widest font-medium mb-3">Completed</h3>
          <div className="space-y-2 opacity-60 mb-8">
            {completed.slice(0, 10).map((task) => (
              <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full glass rounded-2xl p-4 flex items-start gap-4 text-left">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 fill-emerald-500" />
                <p className="text-slate-500 font-medium line-through">{task.title}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {templates.length > 0 && (
        <>
          <h3 className="text-slate-600 text-xs uppercase tracking-widest font-medium mb-3 flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5" /> Recurring
          </h3>
          <div className="space-y-2">
            {templates.map((tpl) => (
              <div key={tpl.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{tpl.title}</p>
                  <p className="text-slate-500 text-xs mt-1 capitalize">
                    {tpl.frequency}{tpl.frequency === 'weekly' && tpl.days_of_week?.length ? ` · ${tpl.days_of_week.map(d => WEEKDAY_LABELS[d]).join(', ')}` : ''}
                    {' · '}{tpl.assigned?.full_name ?? 'Unassigned'}
                  </p>
                </div>
                <button onClick={() => stopRecurringTask(tpl.id)} className="text-slate-600 hover:text-rose-400 text-xs font-medium transition-colors flex-shrink-0">Stop</button>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <AddTaskModal
          members={members}
          onClose={() => setShowModal(false)}
          onSave={async (d) => { await addTask(d); setShowModal(false) }}
          onSaveRecurring={async (d) => { await addRecurringTask(d); setShowModal(false) }}
        />
      )}
    </div>
  )
}

function AddTaskModal({ members, onClose, onSave, onSaveRecurring }) {
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate]   = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [repeat, setRepeat]     = useState('none') // 'none' | 'daily' | 'weekly'
  const [daysOfWeek, setDaysOfWeek] = useState([])
  const [saving, setSaving]     = useState(false)

  function toggleDay(day) {
    setDaysOfWeek(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort())
  }

  async function handleSave() {
    if (!title.trim()) return
    if (repeat === 'weekly' && daysOfWeek.length === 0) return
    setSaving(true)
    if (repeat === 'none') {
      await onSave({ title: title.trim(), priority, due_date: dueDate || null, assigned_to: assignedTo || null })
    } else {
      await onSaveRecurring({
        title: title.trim(),
        priority,
        assigned_to: assignedTo || null,
        frequency: repeat,
        days_of_week: repeat === 'weekly' ? daysOfWeek : null,
      })
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">New Task</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Task</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['low','medium','high'].map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                  priority === p
                    ? p === 'high'   ? 'border-rose-500/60 bg-rose-500/20 text-rose-300'
                      : p === 'medium' ? 'border-amber-500/60 bg-amber-500/20 text-amber-300'
                      : 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >{p}</button>
            ))}
          </div>

          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Repeat</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'none', label: 'One-time' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setRepeat(opt.value)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    repeat === opt.value ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {opt.value !== 'none' && <Repeat className="w-3 h-3" />} {opt.label}
                </button>
              ))}
            </div>
            {repeat === 'weekly' && (
              <div className="grid grid-cols-7 gap-1.5 mt-3">
                {WEEKDAY_LABELS.map((label, i) => (
                  <button key={i} onClick={() => toggleDay(i)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      daysOfWeek.includes(i) ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300' : 'border-white/5 bg-white/5 text-slate-500 hover:bg-white/10'
                    }`}
                  >{label[0]}</button>
                ))}
              </div>
            )}
          </div>

          {repeat === 'none' && (
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]" />
            </div>
          )}

          {members.length > 0 && (
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Assign To</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user_id} value={m.user_id}>{m.profiles?.full_name ?? m.user_id}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 transition-all">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving || (repeat === 'weekly' && daysOfWeek.length === 0)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : repeat === 'none' ? 'Create Task' : 'Create Recurring Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

