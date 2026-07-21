// Radius scales with size rather than being picked per-component — this
// is what collapsed the lg/xl/2xl split found in the design audit for
// what was meant to be one "icon in a colored square" pattern.
const SIZES = {
  xs: { box: 'w-8 h-8',   radius: 'rounded-lg',  icon: 'w-3.5 h-3.5' }, // small inline badge next to a heading
  sm: { box: 'w-8 h-8',   radius: 'rounded-lg',  icon: 'w-4 h-4' },
  md: { box: 'w-10 h-10', radius: 'rounded-xl',  icon: 'w-5 h-5' },
  lg: { box: 'w-12 h-12', radius: 'rounded-2xl', icon: 'w-6 h-6' },
  xl: { box: 'w-16 h-16', radius: 'rounded-2xl', icon: 'w-8 h-8' }, // hero/empty-state/upsell icon
}

const TONES = {
  brand:   'bg-brand',
  indigo:  'bg-indigo-500/20 text-indigo-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  amber:   'bg-amber-500/20 text-amber-400',
  rose:    'bg-rose-500/20 text-rose-400',
  neutral: 'bg-white/5 text-slate-500',
}

/**
 * Icon: Component, sized to match automatically (e.g. `icon={Brain}`).
 * For a raw emoji/glyph, pass children instead. `iconClassName` extends
 * (not overrides) the icon's own classes — e.g. `fill-white` for the brand mark.
 */
export default function IconBadge({ icon: Icon, children, size = 'md', tone = 'brand', className = '', iconClassName = '' }) {
  const s = SIZES[size]
  return (
    <div className={`flex-shrink-0 flex items-center justify-center ${s.box} ${s.radius} ${TONES[tone]} ${className}`}>
      {Icon ? <Icon className={`${s.icon} ${tone === 'brand' ? 'text-white' : ''} ${iconClassName}`} /> : children}
    </div>
  )
}
