import { X, Zap, Check, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'

const FEATURES = {
  documents: {
    title: 'Document Vault',
    description: 'Securely store living wills, insurance cards, medication lists, and POA documents.',
    icon: '📁',
  },
  expenses: {
    title: 'Expense Splitting',
    description: 'Log caregiving costs and split them fairly among family members.',
    icon: '💰',
  },
  ai_advisor: {
    title: 'AI Care Advisor',
    description: 'AI-powered pattern detection that surfaces care insights you\'d otherwise miss.',
    icon: '🧠',
  },
  unlimited_members: {
    title: 'Unlimited Family Members',
    description: 'Add as many family members as you need to your care circle.',
    icon: '👨‍👩‍👧‍👦',
  },
}

const PLAN_PERKS = [
  'Unlimited family members',
  'Document vault (500MB)',
  'Expense splitting & export',
  'AI Care Advisor',
  'Full care log history',
  '14-day free trial',
]

export default function UpgradeModal({ feature, onClose }) {
  const { startCheckout } = useSubscription()
  const [interval, setInterval] = useState('annual')
  const [loading, setLoading] = useState(false)

  const featureInfo = FEATURES[feature] || {
    title: 'Premium Feature',
    description: 'Upgrade to access this and all premium features.',
    icon: '⭐',
  }

  const price = interval === 'annual' ? '$9.99' : '$12.99'

  async function handleUpgrade() {
    setLoading(true)
    try {
      await startCheckout('family', interval)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md glass rounded-3xl p-7 border border-indigo-500/20 animate-slide-up shadow-2xl shadow-indigo-500/20">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Feature callout */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
          <span className="text-3xl">{featureInfo.icon}</span>
          <div>
            <p className="text-white font-bold text-sm">{featureInfo.title}</p>
            <p className="text-slate-400 text-xs leading-relaxed">{featureInfo.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <h2 className="text-white font-black text-xl">Upgrade to Family</h2>
        </div>
        <p className="text-slate-400 text-sm mb-5">
          Unlock every feature. Start with a 14-day free trial.
        </p>

        {/* Interval toggle */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-5">
          {['monthly', 'annual'].map((i) => (
            <button
              key={i}
              onClick={() => setInterval(i)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                interval === i ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {i === 'monthly' ? 'Monthly · $12.99' : 'Annual · $9.99'}
              {i === 'annual' && (
                <span className="ml-1.5 text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                  Save 23%
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Perks */}
        <div className="space-y-2 mb-6">
          {PLAN_PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-300 text-sm">{perk}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5"
        >
          {loading ? 'Redirecting...' : <>Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
        </button>

        <p className="text-slate-600 text-xs text-center mt-3">
          No charge today · Cancel anytime · {price}/month after trial
        </p>
      </div>
    </div>
  )
}
