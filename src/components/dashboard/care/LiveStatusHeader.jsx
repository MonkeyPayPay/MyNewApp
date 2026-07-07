import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { useFlyTo } from './FlyToContext'

const MOOD_EMOJI = { 1: '😞', 2: '🙁', 3: '😐', 4: '🙂', 5: '😄' }

/**
 * The "Dynamic Island" of the app: a single element that morphs between
 * a slim, non-intrusive sticky bar (while scrolling the day's list) and
 * a full status card (on tap), rather than two separate components
 * swapping — that continuity is what sells the Apple-style effect.
 */
export default function LiveStatusHeader({ rightNow, next, todaysDoneCount, todaysTotalCount, mood, waterGlasses, isScrolled }) {
  const [expanded, setExpanded] = useState(false)
  const { registerTarget } = useFlyTo()
  const tallyRef = useRef(null)

  useEffect(() => { registerTarget(tallyRef.current) }, [registerTarget])
  useEffect(() => { if (isScrolled) setExpanded(false) }, [isScrolled])

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-20 mx-auto w-full max-w-2xl px-4 pt-3"
    >
      <motion.button
        layout
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? 'Collapse status card' : 'Expand status card for details'}
        className="w-full text-left bg-black border border-white/20 rounded-[28px] shadow-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {/* Collapsed / always-visible row */}
        <motion.div layout="position" className="flex items-center gap-3 px-5 py-3.5">
          <motion.div layout className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-base truncate">
              {rightNow ? rightNow.label : "You're all caught up"}
            </p>
            {!expanded && (
              <p className="text-slate-400 text-sm truncate">
                {next ? `Next: ${next.label}` : 'Nothing else scheduled today'}
              </p>
            )}
          </div>
          <div
            ref={tallyRef}
            className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1.5 flex-shrink-0"
            aria-label={`${todaysDoneCount} of ${todaysTotalCount} done today`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className="text-white font-bold text-sm tabular-nums">{todaysDoneCount}/{todaysTotalCount}</span>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex-shrink-0">
            <ChevronDown className="w-5 h-5 text-slate-500" />
          </motion.div>
        </motion.div>

        {/* Expanded detail */}
        {expanded && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.25 }}
            className="px-5 pb-5 pt-1 space-y-4 border-t border-white/10"
          >
            {next && (
              <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-lg">🗓️</div>
                <div className="min-w-0">
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">Next</p>
                  <p className="text-white font-semibold truncate">{next.label}</p>
                  {next.sublabel && <p className="text-slate-400 text-sm truncate">{next.sublabel}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-2xl px-4 py-3 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-1">Mood today</p>
                <p className="text-3xl" role="img" aria-label={mood ? `Mood rated ${mood} of 5` : 'No mood logged yet'}>
                  {mood ? MOOD_EMOJI[mood] : '—'}
                </p>
              </div>
              <div className="bg-white/5 rounded-2xl px-4 py-3 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-1">Water</p>
                <p className="text-white font-black text-2xl tabular-nums">{waterGlasses} <span className="text-base font-medium text-slate-400">glasses</span></p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  )
}
