import { useState } from 'react'
import {
  Heart, Home, ClipboardList, Calendar, DollarSign, FolderOpen,
  Bell, LogOut, Plus, CheckCircle, Clock, AlertCircle,
  ChevronRight, Brain, Activity, MessageSquare, Upload, X,
  TrendingUp, Users, Zap, CreditCard, Trash2, Loader
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCircle } from '../../hooks/useCircle'
import { useCareFeed } from '../../hooks/useCareFeed'
import { useTasks } from '../../hooks/useTasks'
import { useExpenses } from '../../hooks/useExpenses'
import { useSubscription } from '../../hooks/useSubscription'
import { useAIAdvisor } from '../../hooks/useAIAdvisor'
import UpgradeModal from '../ui/UpgradeModal'
import NotificationSettings from './NotificationSettings'

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  if (h < 48) return 'Yesterday'
  return `${Math.floor(h / 24)} days ago`
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  medication: { icon: '💊', color: 'bg-emerald-500/20 text-emerald-400', label: 'Medication' },
  medical:    { icon: '🩺', color: 'bg-indigo-500/20 text-indigo-400',   label: 'Medical'   },
  personal:   { icon: '🛒', color: 'bg-purple-500/20 text-purple-400',   label: 'Personal'  },
  note:       { icon: '💬', color: 'bg-orange-500/20 text-orange-400',   label: 'Note'      },
  activity:   { icon: '🏃', color: 'bg-cyan-500/20 text-cyan-400',       label: 'Activity'  },
}

const EXPENSE_CATS = [
  { value: 'medication', label: '💊 Medication' },
  { value: 'food',       label: '🛒 Groceries'  },
  { value: 'transport',  label: '🚗 Transport'  },
  { value: 'medical',    label: '🏥 Medical'    },
  { value: 'other',      label: '📦 Other'      },
]

const EXPENSE_ICONS = { medication: '💊', food: '🛒', transport: '🚗', medical: '🏥', other: '📦' }

const PRIORITY_COLORS = {
  high:   'text-rose-400 bg-rose-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  low:    'text-emerald-400 bg-emerald-500/10',
}

const SEVERITY_STYLES = {
  high:   { border: 'border-rose-500/30 bg-rose-500/5',       tag: 'bg-rose-500/20 text-rose-400'     },
  medium: { border: 'border-amber-500/30 bg-amber-500/5',     tag: 'bg-amber-500/20 text-amber-400'   },
  low:    { border: 'border-emerald-500/30 bg-emerald-500/5', tag: 'bg-emerald-500/20 text-emerald-400' },
}

const navItems = [
  { id: 'home',      icon: <Home className="w-5 h-5" />,         label: 'Dashboard'     },
  { id: 'feed',      icon: <Activity className="w-5 h-5" />,      label: 'Care Feed'     },
  { id: 'tasks',     icon: <ClipboardList className="w-5 h-5" />, label: 'Tasks'         },
  { id: 'calendar',  icon: <Calendar className="w-5 h-5" />,      label: 'Calendar'      },
  { id: 'expenses',  icon: <DollarSign className="w-5 h-5" />,    label: 'Expenses'      },
  { id: 'documents', icon: <FolderOpen className="w-5 h-5" />,    label: 'Documents'     },
  { id: 'ai',        icon: <Brain className="w-5 h-5" />,         label: 'AI Advisor'    },
  { id: 'settings',  icon: <Bell className="w-5 h-5" />,          label: 'Notifications' },
]

const NAV_GATES = { expenses: 'expenses', documents: 'documents', ai: 'ai_advisor' }

const mockDocs = [
  { name: 'Healthcare POA',  type: 'PDF',   updated: 'Jun 20', icon: '📋' },
  { name: 'Medicare Card',   type: 'Image', updated: 'Jun 15', icon: '🪪' },
  { name: 'Medication List', type: 'PDF',   updated: 'Jun 28', icon: '💊' },
  { name: 'Living Will',     type: 'PDF',   updated: 'May 12', icon: '📜' },
  { name: 'Insurance Cards', type: 'Image', updated: 'Jan 3',  icon: '🏥' },
  { name: 'Dr. Chen Notes',  type: 'PDF',   updated: 'Jun 22', icon: '🩺' },
]

// ── Dashboard shell ───────────────────────────────────────────────────────────

export default function Dashboard({ onLogout }) {
  const { circle, recipient, members, loading: circleLoading } = useCircle()
  const { tier, can, openPortal } = useSubscription()
  const { tasks, loading: tasksLoading, addTask, toggleTask, deleteTask } = useTasks(circle?.id)

  const [activeNav, setActiveNav]     = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [upgradeModal, setUpgradeModal] = useState(null)

  const pendingCount = tasks.filter(t => !t.completed_at).length

  function navigateTo(id) {
    const feature = NAV_GATES[id]
    if (feature && !can(feature)) { setUpgradeModal(feature); return }
    setActiveNav(id)
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <HomeView circleId={circle?.id} recipient={recipient} members={members} tasks={tasks} toggleTask={toggleTask} can={can} onUpgrade={setUpgradeModal} onNavigate={navigateTo} />
      case 'feed':
        return <FeedView circleId={circle?.id} />
      case 'tasks':
        return <TasksView tasks={tasks} loading={tasksLoading} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} members={members} />
      case 'expenses':
        return <ExpensesView circleId={circle?.id} members={members} />
      case 'documents':
        return <DocumentsView />
      case 'ai':
        return <AIAdvisorView can={can} onUpgrade={setUpgradeModal} />
      case 'settings':
        return <NotificationSettings />
      default:
        return <HomeView circleId={circle?.id} recipient={recipient} members={members} tasks={tasks} toggleTask={toggleTask} can={can} onUpgrade={setUpgradeModal} onNavigate={navigateTo} />
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a] overflow-hidden">
      {upgradeModal && <UpgradeModal feature={upgradeModal} onClose={() => setUpgradeModal(null)} />}

      {/* Sidebar */}
      <aside className={`flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-[#050510] border-r border-white/5 flex flex-col`}>
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            {sidebarOpen && <span className="text-white font-bold text-lg tracking-tight">CareCircle</span>}
          </div>
        </div>

        {sidebarOpen && (
          <div className="p-4 border-b border-white/5">
            <p className="text-slate-600 text-xs uppercase tracking-widest font-medium mb-2">Caring for</p>
            {circleLoading
              ? <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
              : recipient
                ? (
                  <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {recipient.full_name?.[0] ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{recipient.full_name}</p>
                      <p className="text-slate-500 text-xs">{members.length} family member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )
                : <p className="text-slate-600 text-xs">No circle yet</p>
            }
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isLocked = NAV_GATES[item.id] && !can(NAV_GATES[item.id])
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeNav === item.id
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
                {sidebarOpen && isLocked && <Zap className="w-3.5 h-3.5 text-amber-400 ml-auto" />}
                {sidebarOpen && !isLocked && item.id === 'tasks' && pendingCount > 0 && (
                  <span className="ml-auto bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          {sidebarOpen && tier === 'free' && (
            <button
              onClick={() => setUpgradeModal('ai_advisor')}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 text-sm font-medium text-indigo-300 hover:from-indigo-600/30 hover:to-purple-600/30 transition-all mb-1"
            >
              <Zap className="w-4 h-4 fill-indigo-400 text-indigo-400 flex-shrink-0" />
              Upgrade to Family
            </button>
          )}
          {sidebarOpen && tier !== 'free' && (
            <button onClick={openPortal} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-sm transition-all">
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              Manage Billing
            </button>
          )}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-sm transition-all">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-[#050510]/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-500 hover:text-white transition-colors">
              <div className="space-y-1.5">
                <div className="w-5 h-0.5 bg-current rounded" />
                <div className="w-4 h-0.5 bg-current rounded" />
                <div className="w-5 h-0.5 bg-current rounded" />
              </div>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">{navItems.find(n => n.id === activeNav)?.label || 'Dashboard'}</h1>
              <p className="text-slate-500 text-xs">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative text-slate-500 hover:text-white transition-colors p-2">
              <Bell className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 glass rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">J</div>
              <span className="text-slate-300 text-sm font-medium">Me</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

// ── HomeView ──────────────────────────────────────────────────────────────────

function HomeView({ circleId, recipient, members, tasks, toggleTask, can, onUpgrade, onNavigate }) {
  const { entries } = useCareFeed(circleId)
  const { expenses } = useExpenses(circleId)

  const today   = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const weekAgo  = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const todayTasks    = tasks.filter(t => t.due_date === today)
  const completedToday = todayTasks.filter(t => t.completed_at).length
  const upcoming      = tasks.filter(t => t.due_date > today && t.due_date <= nextWeek && !t.completed_at)
                             .sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 3)
  const weeklyTotal   = expenses.filter(e => e.expense_date >= weekAgo).reduce((s, e) => s + e.amount_cents, 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* AI banner */}
      {can('ai_advisor')
        ? (
          <div className="relative glass rounded-2xl p-5 border border-indigo-500/20 overflow-hidden cursor-pointer" onClick={() => onNavigate('ai')}>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/5" />
            <div className="relative flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">AI Care Advisor</span>
                  <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium">Active</span>
                </div>
                <p className="text-slate-300 text-sm">Patterns detected from your care logs. <span className="text-indigo-400 font-medium">View insights →</span></p>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 border border-white/5 flex items-center gap-4 cursor-pointer" onClick={() => onUpgrade('ai_advisor')}>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-slate-500 text-sm flex-1">Unlock <span className="text-white font-medium">AI Care Advisor</span> for pattern-based insights from your care logs.</p>
            <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold flex-shrink-0">Upgrade</span>
          </div>
        )
      }

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Tasks", value: `${completedToday}/${todayTasks.length}`, sub: 'completed', icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'This Week', value: weeklyTotal > 0 ? `$${(weeklyTotal / 100).toFixed(0)}` : '$0', sub: 'in expenses', icon: <DollarSign className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Open Tasks', value: tasks.filter(t => !t.completed_at).length, sub: 'across all dates', icon: <ClipboardList className="w-5 h-5" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Family Members', value: members.length || '—', sub: 'in this circle', icon: <Users className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>{stat.icon}</div>
            <div className="text-white font-black text-3xl mb-1">{stat.value}</div>
            <div className="text-slate-400 text-xs">{stat.label}</div>
            <div className="text-slate-600 text-xs">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Feed preview */}
        <div className="lg:col-span-3 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold">Recent Care Activity</h2>
            <button onClick={() => onNavigate('feed')} className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {entries.length === 0
            ? (
              <div className="py-8 text-center">
                <p className="text-slate-600 text-sm">No care activity logged yet.</p>
                <button onClick={() => onNavigate('feed')} className="text-indigo-400 text-sm font-medium mt-2 hover:text-indigo-300 transition-colors">Log the first entry →</button>
              </div>
            )
            : (
              <div className="space-y-3">
                {entries.slice(0, 4).map((item) => {
                  const meta = CATEGORY_META[item.category] ?? CATEGORY_META.note
                  return (
                    <div key={item.id} className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                      <span className="text-xl flex-shrink-0 mt-0.5">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 text-sm leading-relaxed">{item.body}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
                          <span className="text-slate-600 text-xs">{item.profiles?.full_name ?? 'Someone'} · {timeAgo(item.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
          <button onClick={() => onNavigate('feed')} className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm font-medium py-3 rounded-xl transition-all">
            <Plus className="w-4 h-4" /> Log care activity
          </button>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Today's Tasks</h2>
              <span className="text-slate-500 text-xs">{completedToday} of {todayTasks.length} done</span>
            </div>
            {todayTasks.length === 0
              ? <p className="text-slate-600 text-sm text-center py-4">Nothing due today 🎉</p>
              : (
                <div className="space-y-2.5">
                  {todayTasks.map((task) => (
                    <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 text-left transition-all group">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${task.completed_at ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-emerald-500'}`}>
                        {task.completed_at && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.completed_at ? 'line-through text-slate-600' : 'text-slate-200'}`}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium}`}>{task.priority}</span>
                          <span className="text-slate-600 text-xs">{task.assigned?.full_name ?? 'Unassigned'}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )
            }
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Upcoming</h2>
            {upcoming.length === 0
              ? <p className="text-slate-600 text-sm text-center py-4">No upcoming tasks this week.</p>
              : (
                <div className="space-y-3">
                  {upcoming.map((task) => {
                    const d   = new Date(task.due_date + 'T00:00:00')
                    const mon = d.toLocaleDateString('en-US', { month: 'short' })
                    return (
                      <div key={task.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                        <div className="text-center flex-shrink-0 w-10">
                          <p className="text-indigo-400 text-xs font-bold uppercase">{mon}</p>
                          <p className="text-white font-black text-lg leading-none">{d.getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">{task.title}</p>
                          <p className="text-slate-500 text-xs">{task.assigned?.full_name ?? 'Unassigned'}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium}`}>{task.priority}</span>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

// ── FeedView ──────────────────────────────────────────────────────────────────

function FeedView({ circleId }) {
  const { user }  = useAuth()
  const { entries, loading, addEntry, deleteEntry } = useCareFeed(circleId)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Care Feed</h2>
          <p className="text-slate-500 text-sm">Every care moment, shared with the whole family</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </div>

      {loading && [1,2,3].map(n => (
        <div key={n} className="glass rounded-2xl p-5 mb-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}

      {!loading && entries.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center border border-white/5">
          <Activity className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No entries yet</p>
          <p className="text-slate-500 text-sm mb-5">Start logging care activities to keep the whole family in sync.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Log the first entry →</button>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((item, i) => {
          const meta  = CATEGORY_META[item.category] ?? CATEGORY_META.note
          const isOwn = item.author_id === user?.id
          return (
            <div key={item.id} className="glass rounded-2xl p-5 card-hover animate-slide-up group" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-start gap-4">
                <div className="text-2xl">{meta.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                    <span className="text-slate-500 text-xs">{item.profiles?.full_name ?? 'Someone'} · {timeAgo(item.created_at)}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{item.body}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 text-xs transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </button>
                    {isOwn && (
                      <button onClick={() => deleteEntry(item.id)} className="flex items-center gap-1.5 text-slate-600 hover:text-rose-400 text-xs transition-colors ml-auto opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <LogEntryModal onClose={() => setShowModal(false)} onSave={async (d) => { await addEntry(d); setShowModal(false) }} />}
    </div>
  )
}

function LogEntryModal({ onClose, onSave }) {
  const [category, setCategory] = useState('note')
  const [body, setBody]         = useState('')
  const [saving, setSaving]     = useState(false)

  async function handleSave() {
    if (!body.trim()) return
    setSaving(true)
    await onSave({ category, body: body.trim() })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Log Care Entry</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-3">Category</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                category === key
                  ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300'
                  : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{meta.icon}</span>
              {meta.label}
            </button>
          ))}
        </div>

        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What happened? Describe the care activity..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-all mb-5"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 transition-all">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!body.trim() || saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── TasksView ─────────────────────────────────────────────────────────────────

function TasksView({ tasks, loading, addTask, toggleTask, deleteTask, members }) {
  const { user }    = useAuth()
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
              <p className="text-white font-medium">{task.title}</p>
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
          <div className="space-y-2 opacity-60">
            {completed.slice(0, 10).map((task) => (
              <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full glass rounded-2xl p-4 flex items-start gap-4 text-left">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 fill-emerald-500" />
                <p className="text-slate-500 font-medium line-through">{task.title}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {showModal && <AddTaskModal members={members} onClose={() => setShowModal(false)} onSave={async (d) => { await addTask(d); setShowModal(false) }} />}
    </div>
  )
}

function AddTaskModal({ members, onClose, onSave }) {
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate]   = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [saving, setSaving]     = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), priority, due_date: dueDate || null, assigned_to: assignedTo || null })
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
            <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]" />
          </div>

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
          <button onClick={handleSave} disabled={!title.trim() || saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ExpensesView ──────────────────────────────────────────────────────────────

function ExpensesView({ circleId, members }) {
  const { user }  = useAuth()
  const { expenses, loading, addExpense, deleteExpense } = useExpenses(circleId)
  const [showModal, setShowModal] = useState(false)

  const thisMonth   = new Date().toISOString().slice(0, 7)
  const monthExp    = expenses.filter(e => e.expense_date?.startsWith(thisMonth))
  const monthTotal  = monthExp.reduce((s, e) => s + e.amount_cents, 0)
  const myTotal     = monthExp.filter(e => e.paid_by === user?.id).reduce((s, e) => s + e.amount_cents, 0)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Expenses</h2>
          <p className="text-slate-500 text-sm">Track, split, and settle caregiving costs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-500 text-xs mb-2">Total This Month</p>
          <p className="text-white font-black text-3xl">${(monthTotal / 100).toFixed(2)}</p>
          <p className="text-slate-600 text-xs mt-1">{monthExp.length} expense{monthExp.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-500 text-xs mb-2">Paid by You</p>
          <p className="text-white font-black text-3xl">${(myTotal / 100).toFixed(2)}</p>
          <p className="text-slate-600 text-xs mt-1">this month</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-500 text-xs mb-2">Circle Members</p>
          <p className="text-white font-black text-3xl">{members.length || '—'}</p>
          <p className="text-slate-600 text-xs mt-1">splitting costs</p>
        </div>
      </div>

      {loading && [1,2,3].map(n => <div key={n} className="glass rounded-2xl p-4 h-16 mb-3 animate-pulse" />)}

      {!loading && expenses.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center border border-white/5">
          <DollarSign className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No expenses yet</p>
          <p className="text-slate-500 text-sm mb-5">Start tracking caregiving costs to split them fairly.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Add the first expense →</button>
        </div>
      )}

      <div className="space-y-3">
        {expenses.map((expense) => {
          const icon  = EXPENSE_ICONS[expense.category] ?? '📦'
          const isOwn = expense.paid_by === user?.id
          return (
            <div key={expense.id} className="glass rounded-2xl p-4 flex items-center gap-4 card-hover group">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{expense.label}</p>
                <p className="text-slate-500 text-xs">{expense.payer?.full_name ?? 'You'} · {fmtDate(expense.expense_date)}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white font-bold">${(expense.amount_cents / 100).toFixed(2)}</p>
                {members.length > 1 && <p className="text-slate-600 text-xs">÷{members.length} = ${(expense.amount_cents / 100 / members.length).toFixed(2)}</p>}
              </div>
              {isOwn && (
                <button onClick={() => deleteExpense(expense.id)} className="text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 ml-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {showModal && <AddExpenseModal onClose={() => setShowModal(false)} onSave={async (d) => { await addExpense(d); setShowModal(false) }} />}
    </div>
  )
}

function AddExpenseModal({ onClose, onSave }) {
  const [label, setLabel]     = useState('')
  const [amount, setAmount]   = useState('')
  const [category, setCategory] = useState('other')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving]   = useState(false)

  async function handleSave() {
    if (!label.trim() || !amount) return
    setSaving(true)
    await onSave({ label: label.trim(), amount, category, expense_date: date })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Add Expense</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4 mb-5">
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Description</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Pharmacy — Metformin" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Amount ($)</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]" />
            </div>
          </div>
          <div>
            <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {EXPENSE_CATS.map(cat => (
                <button key={cat.value} onClick={() => setCategory(cat.value)}
                  className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${category === cat.value ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >{cat.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!label.trim() || !amount || saving} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── DocumentsView (static — storage is a future layer) ───────────────────────

function DocumentsView() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Document Vault</h2>
          <p className="text-slate-500 text-sm">Securely store and share important documents</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </div>
      <div className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/40 transition-colors p-10 text-center mb-6 cursor-pointer group">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-white font-semibold mb-1">Drop files here to upload</p>
        <p className="text-slate-500 text-sm">PDF, JPG, PNG up to 50MB · AI will auto-summarize your documents</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDocs.map((doc) => (
          <div key={doc.name} className="glass rounded-2xl p-5 card-hover cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{doc.icon}</div>
              <span className="text-slate-600 text-xs bg-white/5 px-2 py-1 rounded-lg font-mono">{doc.type}</span>
            </div>
            <p className="text-white font-semibold text-sm mb-1">{doc.name}</p>
            <p className="text-slate-600 text-xs">Updated {doc.updated}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AIAdvisorView ─────────────────────────────────────────────────────────────

function AIAdvisorView({ can, onUpgrade }) {
  const { insights, loading, error, generatedAt, cached, refresh } = useAIAdvisor()

  if (can && !can('ai_advisor')) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in flex flex-col items-center justify-center py-24 text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 flex items-center justify-center">
          <Brain className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">AI Care Advisor</h2>
          <p className="text-slate-500 text-sm max-w-sm">Unlock AI-powered pattern detection and personalized care insights. Available on Family and Pro plans.</p>
        </div>
        <button onClick={() => onUpgrade?.('ai_advisor')} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
          <Zap className="w-4 h-4 fill-white" /> Upgrade to unlock
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl">AI Care Advisor</h2>
          <p className="text-slate-500 text-sm">Pattern detection and personalized care insights</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {generatedAt && (
            <span className="text-slate-600 text-xs">
              {cached ? 'Cached · ' : ''}{new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={refresh} disabled={loading} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-1">
            <TrendingUp className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && !insights && (
        <div className="space-y-4">
          {[1,2,3].map(n => (
            <div key={n} className="glass rounded-2xl p-6 border border-white/5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
          <p className="text-center text-slate-600 text-sm">Claude is reading your care logs…</p>
        </div>
      )}

      {error && !loading && (
        <div className="glass rounded-2xl p-6 border border-rose-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Couldn't generate insights</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <button onClick={refresh} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Try again</button>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-4">
          {insights.map((insight, i) => {
            const styles = SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.low
            return (
              <div key={i} className={`glass rounded-2xl p-6 border ${styles.border}`}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${styles.tag}`}>{insight.tag}</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">{insight.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{insight.body}</p>
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1">
                      {insight.action} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!loading && !error && !insights && (
        <div className="glass rounded-2xl p-10 text-center border border-white/5">
          <Brain className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No insights yet</p>
          <p className="text-slate-500 text-sm mb-5">Start logging care activities to unlock AI-generated insights.</p>
          <button onClick={refresh} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Generate insights</button>
        </div>
      )}

      <div className="mt-6 glass rounded-2xl p-5 border border-white/5">
        <p className="text-slate-500 text-xs text-center">
          AI insights are generated from your care log data. Always consult healthcare professionals for medical decisions.
        </p>
      </div>
    </div>
  )
}
