import { X, Zap, Check, ArrowRight, Globe } from 'lucide-react'
import { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { isIOS } from '../../lib/platform'
import Button from './Button'
import IconBadge from './IconBadge'
import IconButton from './IconButton'
import Modal from './Modal'

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
  const onApple = isIOS()

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
    <Modal onClose={onClose}>
      {(requestClose) => (
        <>
          <IconButton onClick={requestClose} aria-label="Close" className="absolute top-4 right-4">
            <X className="w-5 h-5" />
          </IconButton>

          {/* Feature callout */}
          <div className="flex items-center gap-3 mb-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
            <span className="text-3xl">{featureInfo.icon}</span>
            <div>
              <p className="text-white font-bold text-sm">{featureInfo.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{featureInfo.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <IconBadge icon={Zap} tone="brand" size="xs" />
            <h2 className="text-white font-bold text-lg">Upgrade to Family</h2>
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

          {onApple
            ? (
              /* Apple requires that in-app purchases go through their IAP system.
                 Rather than pay 30%, we direct users to subscribe on the web. */
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center">
                <Globe className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm mb-1">Subscribe on the web</p>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  Apple guidelines require subscriptions to be purchased outside the app.
                  Visit <span className="text-indigo-400 font-medium">carecircle.app</span> in your browser to start your free trial.
                </p>
                <p className="text-slate-600 text-xs">Then come back and enjoy full access here.</p>
              </div>
            )
            : (
              <Button onClick={handleUpgrade} loading={loading} size="lg" className="w-full group">
                {loading ? 'Redirecting...' : <>Start Free Trial <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
              </Button>
            )
          }

          {!onApple && (
            <p className="text-slate-600 text-xs text-center mt-3">
              No charge today · Cancel anytime · {price}/month after trial
            </p>
          )}
        </>
      )}
    </Modal>
  )
}
