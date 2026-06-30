import { useState } from 'react'
import {
  Heart, Home, ClipboardList, Calendar, DollarSign, FolderOpen,
  Bell, Settings, LogOut, Plus, CheckCircle, Clock, AlertCircle,
  ChevronRight, MoreHorizontal, Brain, Activity, Pill, Car,
  Phone, ShoppingCart, Stethoscope, MessageSquare, Upload, X,
  TrendingUp, Users, Star, ArrowUp, ArrowDown, Zap, CreditCard
} from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import UpgradeModal from '../ui/UpgradeModal'

const mockFeed = [
  { id: 1, icon: '💊', category: 'Medication', text: 'Morning medications administered — Lisinopril 10mg, Metformin 500mg', author: 'Sarah', time: '8:12 AM', color: 'bg-emerald-500/20 text-emerald-400' },
  { id: 2, icon: '🩺', category: 'Medical', text: 'Cardiologist appointment confirmed for July 8th at 2:00 PM', author: 'Michael', time: 'Yesterday', color: 'bg-indigo-500/20 text-indigo-400' },
  { id: 3, icon: '🛒', category: 'Personal', text: 'Grocery run completed — picked up all items on the list', author: 'Jordan', time: 'Yesterday', color: 'bg-purple-500/20 text-purple-400' },
  { id: 4, icon: '💬', category: 'Note', text: 'Mom had a wonderful afternoon. Watched her favorite show and ate a full dinner.', author: 'Sarah', time: '2 days ago', color: 'bg-orange-500/20 text-orange-400' },
  { id: 5, icon: '🏥', category: 'Medical', text: 'Blood pressure reading: 128/82 — slightly elevated. Will monitor.', author: 'Michael', time: '3 days ago', color: 'bg-rose-500/20 text-rose-400' },
]

const mockTasks = [
  { id: 1, label: 'Schedule physical therapy evaluation', who: 'Sarah', due: 'Today', priority: 'high', done: false },
  { id: 2, label: 'Pick up Metformin prescription', who: 'You', due: 'Today', priority: 'high', done: false },
  { id: 3, label: 'Review and sign POA documents', who: 'Michael', due: 'Jul 5', priority: 'medium', done: false },
  { id: 4, label: 'Contact Medicare about claim #88432', who: 'You', due: 'Jul 7', priority: 'medium', done: false },
  { id: 5, label: 'Grocery run — list in Notes', who: 'Jordan', due: 'Jul 3', priority: 'low', done: true },
  { id: 6, label: 'Morning medication check', who: 'Sarah', due: 'Today', priority: 'high', done: true },
]

const mockExpenses = [
  { id: 1, label: 'Pharmacy — Lisinopril', amount: 34.99, who: 'Sarah', date: 'Jun 28', category: '💊' },
  { id: 2, label: 'Groceries — Whole Foods', amount: 127.43, who: 'You', date: 'Jun 27', category: '🛒' },
  { id: 3, label: 'Uber to cardiology', amount: 22.00, who: 'Michael', date: 'Jun 25', category: '🚗' },
  { id: 4, label: 'Physical therapy copay', amount: 45.00, who: 'Sarah', date: 'Jun 24', category: '🏥' },
]

const mockDocs = [
  { name: 'Healthcare POA', type: 'PDF', updated: 'Jun 20', icon: '📋' },
  { name: 'Medicare Card', type: 'Image', updated: 'Jun 15', icon: '🪪' },
  { name: 'Medication List', type: 'PDF', updated: 'Jun 28', icon: '💊' },
  { name: 'Living Will', type: 'PDF', updated: 'May 12', icon: '📜' },
  { name: 'Insurance Cards', type: 'Image', updated: 'Jan 3', icon: '🏥' },
  { name: 'Dr. Chen Notes', type: 'PDF', updated: 'Jun 22', icon: '🩺' },
]

const navItems = [
  { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
  { id: 'feed', icon: <Activity className="w-5 h-5" />, label: 'Care Feed' },
  { id: 'tasks', icon: <ClipboardList className="w-5 h-5" />, label: 'Tasks' },
  { id: 'calendar', icon: <Calendar className="w-5 h-5" />, label: 'Calendar' },
  { id: 'expenses', icon: <DollarSign className="w-5 h-5" />, label: 'Expenses' },
  { id: 'documents', icon: <FolderOpen className="w-5 h-5" />, label: 'Documents' },
  { id: 'ai', icon: <Brain className="w-5 h-5" />, label: 'AI Advisor' },
]

const priorityColors = {
  high: 'text-rose-400 bg-rose-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  low: 'text-emerald-400 bg-emerald-500/10',
}

export default function Dashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('home')
  const [tasks, setTasks] = useState(mockTasks)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAIInsight, setShowAIInsight] = useState(true)
  const [upgradeModal, setUpgradeModal] = useState(null)

  const { tier, can, openPortal } = useSubscription()

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const pendingTasks = tasks.filter(t => !t.done).length

  function navigateTo(id) {
    const gated = { expenses: 'expenses', documents: 'documents', ai: 'ai_advisor' }
    const feature = gated[id]
    if (feature && !can(feature)) {
      setUpgradeModal(feature)
      return
    }
    setActiveNav(id)
  }

  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return <HomeView tasks={tasks} toggleTask={toggleTask} pendingTasks={pendingTasks} showAIInsight={showAIInsight} setShowAIInsight={setShowAIInsight} onUpgrade={setUpgradeModal} can={can} />
      case 'feed':
        return <FeedView />
      case 'tasks':
        return <TasksView tasks={tasks} toggleTask={toggleTask} />
      case 'expenses':
        return <ExpensesView />
      case 'documents':
        return <DocumentsView />
      case 'ai':
        return <AIAdvisorView />
      default:
        return <HomeView tasks={tasks} toggleTask={toggleTask} pendingTasks={pendingTasks} showAIInsight={showAIInsight} setShowAIInsight={setShowAIInsight} onUpgrade={setUpgradeModal} can={can} />
    }
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Sidebar */}
      {upgradeModal && <UpgradeModal feature={upgradeModal} onClose={() => setUpgradeModal(null)} />}
      <aside className={`flex-shrink-0 ${sidebarOpen ? 'w-60' : 'w-16'} transition-all duration-300 bg-[#050510] border-r border-white/5 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            {sidebarOpen && <span className="text-white font-bold text-lg tracking-tight">CareCircle</span>}
          </div>
        </div>

        {/* Care recipient */}
        {sidebarOpen && (
          <div className="p-4 border-b border-white/5">
            <p className="text-slate-600 text-xs uppercase tracking-widest font-medium mb-2">Caring for</p>
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">B</div>
              <div>
                <p className="text-white font-semibold text-sm">Betty Johnson</p>
                <p className="text-slate-500 text-xs">78 yrs · 4 family members</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const gated = { expenses: 'expenses', documents: 'documents', ai: 'ai_advisor' }
            const isLocked = gated[item.id] && !can(gated[item.id])
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
                {sidebarOpen && isLocked && (
                  <Zap className="w-3.5 h-3.5 text-amber-400 ml-auto" />
                )}
                {sidebarOpen && !isLocked && item.id === 'tasks' && pendingTasks > 0 && (
                  <span className="ml-auto bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingTasks}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
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
            <button
              onClick={openPortal}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-sm transition-all"
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              Manage Billing
            </button>
          )}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-sm transition-all">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && 'Settings'}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 text-sm transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-[#050510]/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <div className="space-y-1.5">
                <div className="w-5 h-0.5 bg-current rounded" />
                <div className="w-4 h-0.5 bg-current rounded" />
                <div className="w-5 h-0.5 bg-current rounded" />
              </div>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg">
                {navItems.find(n => n.id === activeNav)?.label || 'Dashboard'}
              </h1>
              <p className="text-slate-500 text-xs">Monday, June 30, 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative text-slate-500 hover:text-white transition-colors p-2">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <button className="flex items-center gap-2 glass rounded-xl px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">J</div>
              <span className="text-slate-300 text-sm font-medium">Jordan</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

function HomeView({ tasks, toggleTask, pendingTasks, showAIInsight, setShowAIInsight }) {
  const todayTasks = tasks.filter(t => t.due === 'Today')
  const completedToday = todayTasks.filter(t => t.done).length

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* AI Insight Banner */}
      {showAIInsight && (
        <div className="relative glass rounded-2xl p-5 border border-indigo-500/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/5" />
          <div className="relative flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">AI Care Advisor</span>
                <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full font-medium">New insight</span>
              </div>
              <p className="text-white font-semibold mb-1">Betty's fall risk may be increasing</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                Based on care logs from the past 30 days, Betty has had 3 balance-related incidents — a 200% increase from last month.
                Consider requesting a fall risk assessment at the next cardiologist visit on July 8th.
              </p>
              <div className="flex gap-3 mt-3">
                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Add to agenda →</button>
                <button className="text-slate-500 hover:text-slate-400 text-sm transition-colors">Dismiss</button>
              </div>
            </div>
            <button onClick={() => setShowAIInsight(false)} className="text-slate-600 hover:text-white transition-colors flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Tasks", value: `${completedToday}/${todayTasks.length}`, sub: 'completed', icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'This Week', value: '$229', sub: 'in expenses', icon: <DollarSign className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Documents', value: '12', sub: 'files stored', icon: <FolderOpen className="w-5 h-5" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Family Members', value: '4', sub: 'in this circle', icon: <Users className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <div className="text-white font-black text-3xl mb-1">{stat.value}</div>
            <div className="text-slate-400 text-xs">{stat.label}</div>
            <div className="text-slate-600 text-xs">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Care Feed */}
        <div className="lg:col-span-3 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold">Recent Care Activity</h2>
            <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {mockFeed.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-start gap-4 bg-white/5 rounded-xl p-4">
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-slate-200 text-sm leading-relaxed">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.color}`}>{item.category}</span>
                    <span className="text-slate-600 text-xs">{item.author} · {item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm font-medium py-3 rounded-xl transition-all">
            <Plus className="w-4 h-4" /> Log care activity
          </button>
        </div>

        {/* Tasks + Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Today's Tasks</h2>
              <span className="text-slate-500 text-xs">{completedToday} of {todayTasks.length} done</span>
            </div>
            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="w-full flex items-start gap-3 bg-white/5 hover:bg-white/10 rounded-xl p-3 text-left transition-all group"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 group-hover:border-emerald-500'
                  }`}>
                    {task.done && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-all ${task.done ? 'line-through text-slate-600' : 'text-slate-200'}`}>
                      {task.label}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-slate-600 text-xs">{task.who}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick upcoming */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-white font-bold mb-4">Upcoming</h2>
            <div className="space-y-3">
              {[
                { date: 'Jul 8', label: 'Cardiologist — Dr. Chen', time: '2:00 PM', icon: '🩺' },
                { date: 'Jul 12', label: 'Physical Therapy Eval', time: '10:30 AM', icon: '🏥' },
                { date: 'Jul 15', label: 'Medication Refill Due', time: 'All day', icon: '💊' },
              ].map((event, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                  <div className="text-center flex-shrink-0 w-10">
                    <p className="text-indigo-400 text-xs font-bold uppercase">{event.date.split(' ')[0]}</p>
                    <p className="text-white font-black text-lg leading-none">{event.date.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{event.label}</p>
                    <p className="text-slate-500 text-xs">{event.time}</p>
                  </div>
                  <span className="text-lg">{event.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeedView() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Care Feed</h2>
          <p className="text-slate-500 text-sm">Every care moment, shared with the whole family</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </div>

      <div className="space-y-4">
        {mockFeed.map((item, i) => (
          <div key={item.id} className="glass rounded-2xl p-5 card-hover animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start gap-4">
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${item.color}`}>{item.category}</span>
                  <span className="text-slate-500 text-xs">{item.author} · {item.time}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{item.text}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 text-xs transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" /> Reply
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-500 hover:text-pink-400 text-xs transition-colors">
                    <Heart className="w-3.5 h-3.5" /> React
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TasksView({ tasks, toggleTask }) {
  const pending = tasks.filter(t => !t.done)
  const completed = tasks.filter(t => t.done)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Task Board</h2>
          <p className="text-slate-500 text-sm">{pending.length} pending · {completed.length} completed</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      <div className="space-y-3 mb-8">
        {pending.map((task, i) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className="w-full glass rounded-2xl p-4 flex items-start gap-4 text-left card-hover group"
          >
            <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-emerald-500 flex items-center justify-center flex-shrink-0 mt-1 transition-all" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">{task.label}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${priorityColors[task.priority]}`}>
                  {task.priority} priority
                </span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {task.due}
                </span>
                <span className="text-slate-500 text-xs">{task.who}</span>
              </div>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>

      {completed.length > 0 && (
        <>
          <h3 className="text-slate-600 text-xs uppercase tracking-widest font-medium mb-3">Completed</h3>
          <div className="space-y-2 opacity-60">
            {completed.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className="w-full glass rounded-2xl p-4 flex items-start gap-4 text-left"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5 fill-emerald-500" />
                <p className="text-slate-500 font-medium line-through">{task.label}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ExpensesView() {
  const total = mockExpenses.reduce((sum, e) => sum + e.amount, 0)
  const myShare = total / 4

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Expenses</h2>
          <p className="text-slate-500 text-sm">Track, split, and settle caregiving costs</p>
        </div>
        <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-500 text-xs mb-2">Total This Month</p>
          <p className="text-white font-black text-3xl">${total.toFixed(2)}</p>
          <p className="text-emerald-400 text-xs mt-1 flex items-center gap-1"><ArrowDown className="w-3 h-3" /> 12% vs last month</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-500 text-xs mb-2">Your Share</p>
          <p className="text-white font-black text-3xl">${myShare.toFixed(2)}</p>
          <p className="text-slate-500 text-xs mt-1">Split 4 ways</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-500 text-xs mb-2">You're Owed</p>
          <p className="text-emerald-400 font-black text-3xl">$34.99</p>
          <button className="text-indigo-400 text-xs mt-1 hover:text-indigo-300 transition-colors">Settle up →</button>
        </div>
      </div>

      {/* Expense list */}
      <div className="space-y-3">
        {mockExpenses.map((expense) => (
          <div key={expense.id} className="glass rounded-2xl p-4 flex items-center gap-4 card-hover">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              {expense.category}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{expense.label}</p>
              <p className="text-slate-500 text-xs">{expense.who} · {expense.date}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white font-bold">${expense.amount.toFixed(2)}</p>
              <p className="text-slate-600 text-xs">your share: ${(expense.amount / 4).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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

      {/* Upload area */}
      <div className="glass rounded-2xl border-2 border-dashed border-white/10 hover:border-indigo-500/40 transition-colors p-10 text-center mb-6 cursor-pointer group">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-6 h-6 text-indigo-400" />
        </div>
        <p className="text-white font-semibold mb-1">Drop files here to upload</p>
        <p className="text-slate-500 text-sm">PDF, JPG, PNG up to 50MB · AI will auto-summarize your documents</p>
      </div>

      {/* Doc grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDocs.map((doc) => (
          <div key={doc.name} className="glass rounded-2xl p-5 card-hover cursor-pointer group">
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

function AIAdvisorView() {
  const insights = [
    {
      severity: 'high',
      icon: '⚠️',
      title: 'Fall risk may be increasing',
      body: "Betty has had 3 balance-related incidents in the past 30 days — a 200% increase from last month. We recommend requesting a fall risk assessment at her July 8th cardiologist visit.",
      action: 'Add to appointment agenda',
      color: 'border-rose-500/30 bg-rose-500/5',
      tag: 'High Priority',
      tagColor: 'bg-rose-500/20 text-rose-400',
    },
    {
      severity: 'medium',
      icon: '💊',
      title: 'Medication schedule consistency',
      body: "Evening medications were logged late (8–10 PM instead of 7 PM) on 5 of the last 7 days. Consistent timing improves efficacy for Lisinopril.",
      action: 'Set evening reminder',
      color: 'border-amber-500/30 bg-amber-500/5',
      tag: 'Medication',
      tagColor: 'bg-amber-500/20 text-amber-400',
    },
    {
      severity: 'low',
      icon: '🏃',
      title: 'Activity patterns look positive',
      body: "Betty's daily walks have increased from 10 minutes to 20 minutes over the past 2 weeks — excellent progress! Consider asking her doctor about extending activity goals.",
      action: 'Log in care plan',
      color: 'border-emerald-500/30 bg-emerald-500/5',
      tag: 'Positive Trend',
      tagColor: 'bg-emerald-500/20 text-emerald-400',
    },
  ]

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl">AI Care Advisor</h2>
          <p className="text-slate-500 text-sm">Pattern detection and personalized care insights</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div key={i} className={`glass rounded-2xl p-6 border ${insight.color}`}>
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">{insight.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${insight.tagColor}`}>{insight.tag}</span>
                </div>
                <h3 className="text-white font-bold mb-2">{insight.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">{insight.body}</p>
                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1">
                  {insight.action} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 glass rounded-2xl p-5 border border-white/5">
        <p className="text-slate-500 text-xs text-center">
          AI insights are generated from your care log data. Always consult healthcare professionals for medical decisions.
        </p>
      </div>
    </div>
  )
}
