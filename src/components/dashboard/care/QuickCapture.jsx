import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Loader } from 'lucide-react'
import { haptics } from '../../../lib/haptics'
import { inferDueDate } from '../../../lib/dateParsing'
import { EASE_CALM as EASE } from '../../../lib/motion'

export default function QuickCapture({ onAddTask }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  async function handleSave() {
    if (!text.trim() || saving) return
    setSaving(true)
    haptics.success()
    await onAddTask({ title: text.trim(), priority: 'medium', due_date: inferDueDate(text) })
    setSaving(false)
    setText('')
    setOpen(false)
  }

  return (
    <div className="fixed right-6 z-30" style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute bottom-16 right-0 w-[min(22rem,calc(100vw-3rem))] bg-black border border-white/20 rounded-2xl shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold text-sm">Quick add a task</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close quick add"
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Pick up prescriptions Tuesday"
              className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/60 text-white placeholder:text-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors mb-3"
            />
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {saving ? <><Loader className="w-4 h-4 animate-spin" /> Adding…</> : 'Add task'}
            </button>
            <p className="text-slate-600 text-xs mt-2">Mentions of "today", "tomorrow", or a day name set the date automatically.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.15, ease: EASE }}
        aria-label={open ? 'Close quick add' : 'Quickly add a task'}
        aria-expanded={open}
        className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </motion.div>
      </motion.button>
    </div>
  )
}
