import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, Users, Brain, PartyPopper } from 'lucide-react'
import { useAppointments } from '../../../hooks/useAppointments'
import { useVitals } from '../../../hooks/useVitals'
import { useCareFeed } from '../../../hooks/useCareFeed'
import { haptics } from '../../../lib/haptics'
import DetailSlideOver from '../../ui/DetailSlideOver'
import { FlyToProvider, useFlyTo } from './FlyToContext'
import LiveStatusHeader from './LiveStatusHeader'
import QuickVitalsLog from './QuickVitalsLog'
import QuickCapture from './QuickCapture'

const EASE = [0.22, 1, 0.36, 1] // calm, grounded deceleration
const PRIORITY_DOT = { high: 'bg-rose-400', medium: 'bg-amber-400', low: 'bg-emerald-400' }

function findScrollParent(el) {
  let node = el?.parentElement
  while (node) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY)) return node
    node = node.parentElement
  }
  return null
}

/** Detects scroll on whatever ancestor actually scrolls (Dashboard's <main>). */
function useScrolledPastTop(ref) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const root = findScrollParent(ref.current)
    if (!root) return
    const onScroll = () => setScrolled(root.scrollTop > 12)
    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [ref])
  return scrolled
}

function TaskCheckbox({ done, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      transition={{ duration: 0.15, ease: EASE }}
      aria-label={done ? 'Mark as not done' : 'Mark as done'}
      aria-pressed={done}
      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
        done ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 hover:border-emerald-400'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done && (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <CheckCircle className="w-7 h-7 text-black fill-black" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function TaskRow({ task, onToggle, onOpenDetail }) {
  const { flyToTarget } = useFlyTo()
  const checkboxWrapRef = useRef(null)
  const done = !!task.completed_at

  function handleToggle() {
    haptics.success()
    if (!done) flyToTarget(checkboxWrapRef.current, { emoji: '✓', color: '#34d399' })
    onToggle(task.id)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-center gap-4 bg-white/5 rounded-2xl px-4 py-3.5"
    >
      <div ref={checkboxWrapRef}>
        <TaskCheckbox done={done} onToggle={handleToggle} />
      </div>
      <button
        onClick={() => onOpenDetail(task)}
        className="flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
      >
        <p className={`font-semibold text-base leading-snug ${done ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority] ?? PRIORITY_DOT.medium}`} aria-hidden="true" />
          <span className="text-slate-400 text-sm">{task.assigned?.full_name ?? 'Unassigned'}</span>
        </div>
      </button>
      <button
        onClick={() => onOpenDetail(task)}
        aria-label={`Details for ${task.title}`}
        className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-white transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </motion.li>
  )
}

function TaskDetailPanel({ task, feedEntries }) {
  if (!task) return null
  const keywords = /med|pill|prescri/i.test(task.title)
  const related = feedEntries
    .filter(e => !keywords || e.category === 'medication' || e.category === 'medical')
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Assigned to</span>
          <span className="text-white font-medium">{task.assigned?.full_name ?? 'Unassigned'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Priority</span>
          <span className="text-white font-medium capitalize">{task.priority}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Due</span>
          <span className="text-white font-medium">{task.due_date ?? '—'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm">Status</span>
          <span className={`font-medium ${task.completed_at ? 'text-emerald-400' : 'text-amber-400'}`}>
            {task.completed_at ? 'Done' : 'Not yet done'}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-3">Recent related history</h3>
        {related.length === 0 ? (
          <p className="text-slate-500 text-sm">No related care notes logged yet.</p>
        ) : (
          <ul className="space-y-3">
            {related.map(e => (
              <li key={e.id} className="bg-white/5 rounded-xl p-3">
                <p className="text-slate-200 text-sm leading-relaxed">{e.body}</p>
                <p className="text-slate-500 text-xs mt-1.5">{e.profiles?.full_name ?? 'Someone'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function CareTimelineInner({ circleId, recipient, members, tasks, toggleTask, addTask, can, onUpgrade, onNavigate, simplified }) {
  const { appointments } = useAppointments(circleId)
  const vitals = useVitals(circleId)
  const { entries: feedEntries } = useCareFeed(circleId)
  const [detailTask, setDetailTask] = useState(null)
  const sentinelRef = useRef(null)
  const isScrolled = useScrolledPastTop(sentinelRef)
  const { flyToTarget } = useFlyTo()
  const heroCheckRef = useRef(null)

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = useMemo(
    () => tasks.filter(t => t.due_date === today)
      .sort((a, b) => (a.completed_at ? 1 : 0) - (b.completed_at ? 1 : 0)),
    [tasks, today]
  )
  const remainingToday = todayTasks.filter(t => !t.completed_at)
  const doneCount = todayTasks.length - remainingToday.length
  const rightNowTask = remainingToday[0] ?? null

  const nextAppointment = useMemo(() => {
    const now = Date.now()
    return appointments.find(a => new Date(a.starts_at).getTime() >= now) ?? null
  }, [appointments])

  const nextItem = nextAppointment
    ? {
        label: nextAppointment.title,
        sublabel: new Date(nextAppointment.starts_at).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
      }
    : (remainingToday[1] ? { label: remainingToday[1].title } : null)

  function handleRightNowComplete() {
    if (!rightNowTask) return
    haptics.success()
    flyToTarget(heroCheckRef.current, { emoji: '✓', color: '#34d399' })
    toggleTask(rightNowTask.id)
  }

  return (
    <div className="max-w-2xl mx-auto -mx-6 -mt-6">
      <div ref={sentinelRef} />
      <LiveStatusHeader
        rightNow={rightNowTask ? { label: rightNowTask.title } : null}
        next={nextItem}
        todaysDoneCount={doneCount}
        todaysTotalCount={todayTasks.length}
        mood={vitals.today.latestMood?.value}
        waterGlasses={vitals.today.waterGlasses}
        isScrolled={isScrolled}
      />

      <div className="px-4 pt-6 space-y-6 pb-10">
        {/* Right Now — the single most important thing, oversized and unmissable */}
        <section aria-label="Right now" className="bg-black border border-white/15 rounded-3xl p-6">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3">Right now</p>
          <AnimatePresence mode="wait">
            {rightNowTask ? (
              <motion.div
                key={rightNowTask.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <h2 className="text-white font-black text-2xl leading-tight mb-1">{rightNowTask.title}</h2>
                <p className="text-slate-400 mb-5">
                  {rightNowTask.assigned?.full_name ?? recipient?.full_name ?? 'Care recipient'}
                </p>
                <div ref={heroCheckRef}>
                  <motion.button
                    onClick={handleRightNowComplete}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg py-5 rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <CheckCircle className="w-6 h-6" /> Mark done
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="text-center py-6"
              >
                <PartyPopper className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-bold text-xl mb-1">All caught up for today</p>
                <p className="text-slate-400">Nothing else needs attention right now.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <QuickVitalsLog vitals={vitals} onLog={vitals.log} />

        {/* Today's full list */}
        {todayTasks.length > 0 && (
          <section aria-label="Today's tasks">
            <h2 className="text-white font-bold text-lg mb-3">Today</h2>
            <ul className="space-y-2.5">
              <AnimatePresence initial={false}>
                {todayTasks.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} onOpenDetail={setDetailTask} />
                ))}
              </AnimatePresence>
            </ul>
          </section>
        )}

        {/* Quiet secondary links — administrative, so hidden in simplified/recipient mode */}
        {!simplified && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => can('ai_advisor') ? onNavigate('ai') : onUpgrade('ai_advisor')}
              className="flex-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-2xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Brain className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm font-medium">Care Advisor</span>
            </button>
            <button
              onClick={() => onNavigate('feed')}
              className="flex-1 flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-2xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Users className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm font-medium">{members.length} in circle</span>
            </button>
          </div>
        )}
      </div>

      <DetailSlideOver open={!!detailTask} onClose={() => setDetailTask(null)} title={detailTask?.title ?? ''}>
        <TaskDetailPanel task={detailTask} feedEntries={feedEntries} />
      </DetailSlideOver>

      {!simplified && <QuickCapture onAddTask={addTask} />}
    </div>
  )
}

export default function CareTimeline(props) {
  return (
    <FlyToProvider>
      <CareTimelineInner {...props} />
    </FlyToProvider>
  )
}
