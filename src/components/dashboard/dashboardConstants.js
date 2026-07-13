export const CATEGORY_META = {
  medication: { icon: '💊', color: 'bg-emerald-500/20 text-emerald-400', label: 'Medication' },
  medical:    { icon: '🩺', color: 'bg-indigo-500/20 text-indigo-400',   label: 'Medical'   },
  personal:   { icon: '🛒', color: 'bg-purple-500/20 text-purple-400',   label: 'Personal'  },
  note:       { icon: '💬', color: 'bg-orange-500/20 text-orange-400',   label: 'Note'      },
  activity:   { icon: '🏃', color: 'bg-cyan-500/20 text-cyan-400',       label: 'Activity'  },
}

export const EXPENSE_CATS = [
  { value: 'medication', label: '💊 Medication' },
  { value: 'food',       label: '🛒 Groceries'  },
  { value: 'transport',  label: '🚗 Transport'  },
  { value: 'medical',    label: '🏥 Medical'    },
  { value: 'other',      label: '📦 Other'      },
]

export const EXPENSE_ICONS = { medication: '💊', food: '🛒', transport: '🚗', medical: '🏥', other: '📦' }

export const PRIORITY_COLORS = {
  high:   'text-rose-400 bg-rose-500/10',
  medium: 'text-amber-400 bg-amber-500/10',
  low:    'text-emerald-400 bg-emerald-500/10',
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const SEVERITY_STYLES = {
  high:   { border: 'border-rose-500/30 bg-rose-500/5',       tag: 'bg-rose-500/20 text-rose-400'     },
  medium: { border: 'border-amber-500/30 bg-amber-500/5',     tag: 'bg-amber-500/20 text-amber-400'   },
  low:    { border: 'border-emerald-500/30 bg-emerald-500/5', tag: 'bg-emerald-500/20 text-emerald-400' },
}
