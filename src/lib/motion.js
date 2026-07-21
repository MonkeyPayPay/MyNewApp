/**
 * Shared motion language for the whole app — one physics vocabulary
 * instead of every screen inventing its own timing. Originated in the
 * care/ dashboard widgets (calm, grounded deceleration; no snappy
 * overshoot, since the audience is stressed caregivers and elderly
 * users) — this just gives every other screen the same constants.
 */

// Calm, deliberate ease-out. Default for entrances, reveals, and color/opacity transitions.
export const EASE_CALM = [0.22, 1, 0.36, 1]

// Tap/press feedback — quick in, quick settle.
export const TAP_TRANSITION = { duration: 0.15, ease: EASE_CALM }

// Spring for panels/sheets that should feel physical (slide-overs, dropdowns).
export const SPRING_PANEL = { type: 'spring', stiffness: 300, damping: 30 }

// Standard entrance for cards/list rows appearing in a list.
export const fadeSlideUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.4, ease: EASE_CALM },
}

// Modal/dialog backdrop.
export const backdropFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: EASE_CALM },
}

// Modal/dialog card — a soft scale+rise, not a snap.
export const modalPop = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } },
  transition: { duration: 0.3, ease: EASE_CALM },
}
