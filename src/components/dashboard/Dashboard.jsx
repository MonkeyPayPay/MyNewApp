import { useState, useEffect } from 'react'
import {
  Heart, Home, ClipboardList, Calendar, DollarSign, FolderOpen,
  Bell, LogOut, Zap, CreditCard, UserPlus, Brain, Activity
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCircle } from '../../hooks/useCircle'
import { useTasks } from '../../hooks/useTasks'
import { useSubscription } from '../../hooks/useSubscription'
import UpgradeModal from '../ui/UpgradeModal'
import NotificationSettings from './NotificationSettings'
import CareTimeline from './care/CareTimeline'
import InviteModal from './InviteModal'
import FeedView from './views/FeedView'
import TasksView from './views/TasksView'
import ExpensesView from './views/ExpensesView'
import DocumentsView from './views/DocumentsView'
import CalendarView from './views/CalendarView'
import AIAdvisorView from './views/AIAdvisorView'

// ── Constants ─────────────────────────────────────────────────────────────────

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

// Hidden entirely (not just paywalled) for the scoped professional-caregiver
// circle role — enforced again server-side via RLS, this just keeps the UI
// from showing a tab that would only error out.
const RESTRICTED_ROLE_NAV = ['expenses', 'documents', 'ai']
const RESTRICTED_ROLE_FEATURES = ['expenses', 'documents', 'ai_advisor']

// ── Dashboard shell ───────────────────────────────────────────────────────────

export default function Dashboard({ onLogout, onRegisterNavigate }) {
  const { user } = useAuth()
  const { circle, recipient, members, myRole, loading: circleLoading, inviteMember } = useCircle()
  const { tier, isTrialing, trialDaysLeft, can: canByTier, openPortal } = useSubscription()
  // Role-aware on top of tier-aware: the professional-caregiver circle
  // role never sees these features, regardless of the circle's plan.
  const can = (feature) => (myRole === 'caregiver' && RESTRICTED_ROLE_FEATURES.includes(feature)) ? false : canByTier(feature)
  const { tasks, loading: tasksLoading, addTask, toggleTask, deleteTask } = useTasks(circle?.id)

  const [activeNav, setActiveNav]       = useState('home')
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [upgradeModal, setUpgradeModal] = useState(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Register deep-link handler for push notification taps
  useEffect(() => { onRegisterNavigate?.(navigateTo) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const firstName  = user?.user_metadata?.full_name?.split(' ')[0] ?? 'Me'
  const initials   = user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const pendingCount = tasks.filter(t => !t.completed_at).length

  const visibleNavItems = myRole === 'caregiver'
    ? navItems.filter(item => !RESTRICTED_ROLE_NAV.includes(item.id))
    : navItems

  function navigateTo(id) {
    if (myRole === 'caregiver' && RESTRICTED_ROLE_NAV.includes(id)) return
    const feature = NAV_GATES[id]
    if (feature && !can(feature)) { setUpgradeModal(feature); return }
    setActiveNav(id)
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <CareTimeline circleId={circle?.id} recipient={recipient} members={members} tasks={tasks} toggleTask={toggleTask} addTask={addTask} can={can} onUpgrade={setUpgradeModal} onNavigate={navigateTo} />
      case 'feed':
        return <FeedView circleId={circle?.id} />
      case 'tasks':
        return <TasksView circleId={circle?.id} tasks={tasks} loading={tasksLoading} addTask={addTask} toggleTask={toggleTask} deleteTask={deleteTask} members={members} />
      case 'expenses':
        return <ExpensesView circleId={circle?.id} members={members} can={can} />
      case 'calendar':
        return <CalendarView circleId={circle?.id} can={can} />
      case 'documents':
        return <DocumentsView circleId={circle?.id} />
      case 'ai':
        return <AIAdvisorView can={can} onUpgrade={setUpgradeModal} />
      case 'settings':
        return <NotificationSettings />
      default:
        return <CareTimeline circleId={circle?.id} recipient={recipient} members={members} tasks={tasks} toggleTask={toggleTask} addTask={addTask} can={can} onUpgrade={setUpgradeModal} onNavigate={navigateTo} />
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a] overflow-hidden">
      {upgradeModal && <UpgradeModal feature={upgradeModal} onClose={() => setUpgradeModal(null)} />}
      {showInviteModal && <InviteModal can={can} onClose={() => setShowInviteModal(false)} onSend={inviteMember} />}

      {/* Sidebar */}
      <aside className={`flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-[#050510] border-r border-white/5 flex flex-col`}>
        <div className="px-4 pb-4 pt-safe border-b border-white/5">
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
            {circle && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 text-xs font-medium transition-all"
              >
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                Invite family member
              </button>
            )}
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
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

        <div className="p-3 pb-safe border-t border-white/5 space-y-1">
          {sidebarOpen && (
            <button
              onClick={() => tier === 'free' ? setUpgradeModal('ai_advisor') : openPortal()}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold mb-1 transition-all ${
                tier === 'pro'
                  ? 'bg-orange-500/10 text-orange-300 hover:bg-orange-500/20'
                  : tier === 'family'
                    ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <span className="uppercase tracking-wide">{tier} plan</span>
              {isTrialing && trialDaysLeft !== null && (
                <span className="font-medium normal-case tracking-normal">{trialDaysLeft}d left in trial</span>
              )}
            </button>
          )}
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
        <header className="bg-[#050510]/80 backdrop-blur border-b border-white/5 px-6 pb-4 pt-safe flex items-center justify-between flex-shrink-0">
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
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
              <span className="text-slate-300 text-sm font-medium">{firstName}</span>
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

