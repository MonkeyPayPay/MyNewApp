import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Droplet, Activity, HeartPulse } from 'lucide-react'
import { haptics } from '../../../lib/haptics'

const MOODS = [
  { value: 1, emoji: '😞', label: 'Struggling' },
  { value: 2, emoji: '🙁', label: 'Not great' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

const EASE = [0.22, 1, 0.36, 1] // calm, deliberate deceleration — no snappy overshoot

function BigStepper({ label, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
      <span className="text-white font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={() => { haptics.tap(); onChange(Math.max(min, value - step)) }}
          aria-label={`Decrease ${label}`}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Minus className="w-6 h-6" />
        </button>
        <span className="text-white font-black text-3xl tabular-nums w-16 text-center" aria-live="polite">{value}{unit}</span>
        <button
          onClick={() => { haptics.tap(); onChange(Math.min(max, value + step)) }}
          aria-label={`Increase ${label}`}
          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 transition-all flex items-center justify-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default function QuickVitalsLog({ vitals, onLog }) {
  const [openPanel, setOpenPanel] = useState(null) // 'bp' | 'pain' | null
  const [systolic, setSystolic]   = useState(120)
  const [diastolic, setDiastolic] = useState(80)
  const [pain, setPain]           = useState(0)

  async function logMood(value) {
    haptics.success()
    await onLog('mood', value)
  }

  async function logWater() {
    haptics.tap()
    await onLog('water', 1)
  }

  async function saveBp() {
    haptics.success()
    await onLog('blood_pressure', systolic, diastolic)
    setOpenPanel(null)
  }

  async function savePain() {
    haptics.success()
    await onLog('pain', pain)
    setOpenPanel(null)
  }

  return (
    <section className="bg-black border border-white/15 rounded-3xl p-5 space-y-5" aria-label="Log how you're feeling">
      <h2 className="text-white font-bold text-lg flex items-center gap-2">
        <Activity className="w-5 h-5 text-emerald-400" /> How are you feeling?
      </h2>

      {/* Mood — 5 oversized emoji buttons */}
      <div>
        <p className="text-slate-400 text-sm font-medium mb-2">Mood</p>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map(m => (
            <motion.button
              key={m.value}
              onClick={() => logMood(m.value)}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.15, ease: EASE }}
              aria-label={m.label}
              aria-pressed={vitals.today.latestMood?.value === m.value}
              className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                vitals.today.latestMood?.value === m.value ? 'bg-emerald-500/25 ring-2 ring-emerald-400' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span role="img" aria-hidden="true">{m.emoji}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Water — one big tap-to-add button */}
      <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3.5">
        <div className="flex items-center gap-3">
          <Droplet className="w-6 h-6 text-cyan-400 flex-shrink-0" />
          <div>
            <p className="text-white font-semibold">Water</p>
            <p className="text-slate-400 text-sm">{vitals.today.waterGlasses} glasses today</p>
          </div>
        </div>
        <motion.button
          onClick={logWater}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.15, ease: EASE }}
          aria-label="Add one glass of water"
          className="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </div>

      {/* Blood pressure — inline expanding stepper, not a modal */}
      <div>
        <button
          onClick={() => setOpenPanel(p => p === 'bp' ? null : 'bp')}
          aria-expanded={openPanel === 'bp'}
          className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-2xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <div className="flex items-center gap-3">
            <HeartPulse className="w-6 h-6 text-rose-400 flex-shrink-0" />
            <div className="text-left">
              <p className="text-white font-semibold">Blood pressure</p>
              <p className="text-slate-400 text-sm">
                {vitals.today.latestBp ? `${vitals.today.latestBp.value}/${vitals.today.latestBp.value_secondary} logged today` : 'Not logged yet'}
              </p>
            </div>
          </div>
        </button>
        <AnimatePresence>
          {openPanel === 'bp' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2">
                <BigStepper label="Systolic" value={systolic} onChange={setSystolic} min={70} max={220} step={2} />
                <BigStepper label="Diastolic" value={diastolic} onChange={setDiastolic} min={40} max={140} step={2} />
                <button
                  onClick={saveBp}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Save blood pressure
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pain scale — inline expanding 0-10 grid, not a modal */}
      <div>
        <button
          onClick={() => setOpenPanel(p => p === 'pain' ? null : 'pain')}
          aria-expanded={openPanel === 'pain'}
          className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-2xl px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0" role="img" aria-hidden="true">🩹</span>
            <div className="text-left">
              <p className="text-white font-semibold">Pain level</p>
              <p className="text-slate-400 text-sm">
                {vitals.today.latestPain ? `${vitals.today.latestPain.value}/10 logged today` : 'Not logged yet'}
              </p>
            </div>
          </div>
        </button>
        <AnimatePresence>
          {openPanel === 'pain' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                <div className="grid grid-cols-6 gap-2" role="radiogroup" aria-label="Pain level, 0 to 10">
                  {Array.from({ length: 11 }, (_, i) => i).map(n => (
                    <button
                      key={n}
                      onClick={() => { haptics.tap(); setPain(n) }}
                      role="radio"
                      aria-checked={pain === n}
                      className={`aspect-square rounded-xl flex items-center justify-center font-bold text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        pain === n ? 'bg-rose-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={savePain}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Save pain level
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
