import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { TAP_TRANSITION } from '../../lib/motion'

const VARIANTS = {
  ghost: 'text-slate-400 hover:text-white hover:bg-white/10',
  solid: 'bg-white/10 text-white hover:bg-white/20',
  danger: 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10',
}

// Every size here is >=44px (WCAG 2.5.5) — this is the fix for the
// audit's biggest finding: 6 of 7 modal close buttons had no defined
// touch target at all (~20px, icon-only). Use this instead of a bare
// <button><X /></button>, always.
const SIZES = {
  md: 'w-11 h-11', // 44px
  lg: 'w-12 h-12', // 48px
}

/**
 * Icon-only button (close, delete, chevron, etc.) with a guaranteed
 * accessible hit target regardless of how small the icon inside looks.
 */
const IconButton = forwardRef(function IconButton(
  { variant = 'ghost', size = 'md', className = '', children, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.88 }}
      transition={TAP_TRANSITION}
      className={`inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
})

export default IconButton
