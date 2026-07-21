import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { backdropFade, SPRING_PANEL } from '../../lib/motion'
import IconButton from './IconButton'

/**
 * A calm, contextual side panel — the Notion Calendar alternative to a
 * jarring full-screen modal. The main timeline stays visible and
 * scrollable behind a soft backdrop, so the user never loses their
 * place. Deliberately gentle easing (no snappy overshoot) per the
 * "tactile reassurance" design goal.
 */
export default function DetailSlideOver({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            {...backdropFade}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[26rem] bg-ink-950 border-l border-white/15 shadow-elevation-2 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={SPRING_PANEL}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
              <h2 className="text-white font-bold text-xl">{title}</h2>
              <IconButton onClick={onClose} aria-label="Close panel">
                <X className="w-5 h-5" />
              </IconButton>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
