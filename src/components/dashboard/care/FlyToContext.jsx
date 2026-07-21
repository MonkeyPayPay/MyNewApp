import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const FlyToContext = createContext(null)

/**
 * Spatial "cause and effect" motion (Arc-style): when a card fires
 * flyToTarget(originEl), a small marker travels from that element's
 * screen position to whatever ref last called registerTarget — e.g. the
 * daily tally inside LiveStatusHeader. This is how a senior user builds
 * a mental model of "where did my completed task go."
 *
 * Respects prefers-reduced-motion by skipping the flight and firing the
 * onArrive callback immediately instead of hiding the feedback entirely.
 */
export function FlyToProvider({ children }) {
  const targetRef = useRef(null)
  const [flights, setFlights] = useState([])
  const reduceMotion = useReducedMotion()

  const registerTarget = useCallback((el) => { targetRef.current = el }, [])

  const flyToTarget = useCallback((originEl, { emoji = '✓', color = '#34d399', onArrive } = {}) => {
    if (!originEl) return
    if (reduceMotion || !targetRef.current) { onArrive?.(); return }

    const from = originEl.getBoundingClientRect()
    const to   = targetRef.current.getBoundingClientRect()
    const id   = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    setFlights(prev => [...prev, {
      id, emoji, color,
      fromX: from.left + from.width / 2,
      fromY: from.top + from.height / 2,
      toX:   to.left + to.width / 2,
      toY:   to.top + to.height / 2,
    }])

    setTimeout(() => {
      setFlights(prev => prev.filter(f => f.id !== id))
      onArrive?.()
    }, 700)
  }, [reduceMotion])

  return (
    <FlyToContext.Provider value={{ registerTarget, flyToTarget }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[200]" aria-hidden="true">
        <AnimatePresence>
          {flights.map(f => (
            <motion.div
              key={f.id}
              initial={{ x: f.fromX, y: f.fromY, scale: 1, opacity: 1 }}
              animate={{ x: f.toX, y: f.toY, scale: 0.35, opacity: 0.9 }}
              exit={{ opacity: 0, scale: 0.15, transition: { duration: 0.15 } }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'fixed', left: 0, top: 0, translateX: '-50%', translateY: '-50%' }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-base font-bold shadow-xl"
            >
              <span
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: f.color, boxShadow: `0 0 24px ${f.color}99` }}
              >
                {f.emoji}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToContext.Provider>
  )
}

export function useFlyTo() {
  const ctx = useContext(FlyToContext)
  if (!ctx) throw new Error('useFlyTo must be used inside FlyToProvider')
  return ctx
}
