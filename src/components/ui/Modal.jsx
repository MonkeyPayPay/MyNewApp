import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { backdropFade, modalPop } from '../../lib/motion'
import IconButton from './IconButton'
import { X } from 'lucide-react'

/**
 * The one centered-dialog shell. Every "New Task" / "New Expense" /
 * "Invite" / "Upgrade" modal should render through this instead of
 * hand-rolling its own backdrop div — that's what collapsed the
 * rounded-2xl vs rounded-3xl split (and the six different close-button
 * implementations) found in the design audit into a single component.
 *
 * Call sites across this app conditionally *mount* modals
 * (`{show && <Modal>}`) rather than passing an `open` prop, so `onClose`
 * here is intercepted: it plays the exit animation first, then calls the
 * real `onClose` (which triggers the parent's unmount) once it's done —
 * a plain conditional render still gets a graceful close.
 */
export default function Modal({ onClose, title, maxWidth = 'max-w-md', children }) {
  const [closing, setClosing] = useState(false)

  // If a new Modal mounts (e.g. a different modal replaces this one),
  // make sure it starts open rather than inheriting stale closing state.
  useEffect(() => { setClosing(false) }, [])

  function requestClose() { setClosing(true) }

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') requestClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <AnimatePresence onExitComplete={onClose}>
      {!closing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            {...backdropFade}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={requestClose}
            aria-hidden="true"
          />
          <motion.div
            {...modalPop}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full ${maxWidth} max-h-[85vh] overflow-y-auto bg-ink-950 rounded-3xl p-6 border border-white/10 shadow-elevation-2`}
            onClick={e => e.stopPropagation()}
          >
            {title && (
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">{title}</h3>
                <IconButton onClick={requestClose} aria-label="Close" className="-mr-2 -mt-1">
                  <X className="w-5 h-5" />
                </IconButton>
              </div>
            )}
            {typeof children === 'function' ? children(requestClose) : children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
