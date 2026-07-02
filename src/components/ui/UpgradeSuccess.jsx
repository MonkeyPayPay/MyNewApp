import { useEffect, useState } from 'react'
import { Zap, X, Check } from 'lucide-react'
import { track } from '../../lib/analytics'

const PERKS = {
  family: [
    'Document vault unlocked',
    'Expense splitting & CSV export',
    'AI Care Advisor',
    'Unlimited family members',
  ],
  pro: [
    'Everything in Family',
    'Professional caregiver portal',
    'Medication interaction alerts',
    'Phone support',
  ],
}

export default function UpgradeSuccess({ tier = 'family', onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    track('trial_started', { plan: tier }, { once: true })
    // Tiny delay so the animation plays after mount
    const t = setTimeout(() => setShow(true), 50)
    return () => clearTimeout(t)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  function dismiss() {
    setShow(false)
    setTimeout(onClose, 300)
  }

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`glass rounded-3xl p-8 w-full max-w-md border border-white/10 relative transition-all duration-300 ${show ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <button onClick={dismiss} className="absolute top-4 right-4 text-slate-600 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/30">
            <Zap className="w-10 h-10 text-white fill-white" />
          </div>
          <h2 className="text-white font-black text-2xl mb-2">
            Welcome to {tier.charAt(0).toUpperCase() + tier.slice(1)}!
          </h2>
          <p className="text-slate-400 text-sm">Your 14-day free trial has started. Here's what you just unlocked:</p>
        </div>

        <div className="space-y-3 mb-8">
          {(PERKS[tier] ?? PERKS.family).map((perk) => (
            <div key={perk} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-slate-200 text-sm">{perk}</span>
            </div>
          ))}
        </div>

        <button
          onClick={dismiss}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all"
        >
          Start exploring →
        </button>
      </div>
    </div>
  )
}
