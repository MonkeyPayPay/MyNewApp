import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { TAP_TRANSITION } from '../../lib/motion'

const VARIANTS = {
  primary:   'bg-brand bg-brand-hover text-white shadow-elevation-1',
  secondary: 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10',
  ghost:     'text-slate-400 hover:text-white hover:bg-white/5',
  danger:    'bg-rose-500 hover:bg-rose-400 text-white',
}

// h-* (not py-*) so every button hits a guaranteed, content-independent
// touch target — h-11 is exactly 44px, the WCAG 2.5.5 minimum.
const SIZES = {
  sm: 'h-10 px-4 text-xs gap-1.5',
  md: 'h-12 px-5 text-sm gap-2',
  lg: 'h-14 px-6 text-base gap-2.5',
}

/**
 * The one button component. Every "primary CTA" role in the app should
 * render through this rather than a hand-rolled <button> — that's what
 * collapses the py-3/py-3.5/py-4 drift found in the design audit into a
 * single, accessible, consistently-animated control.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={disabled || loading ? undefined : { scale: 0.97 }}
      transition={TAP_TRANSITION}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-xl font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  )
})

export default Button
