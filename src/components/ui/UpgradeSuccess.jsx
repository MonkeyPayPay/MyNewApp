import { useEffect } from 'react'
import { Zap, X, Check } from 'lucide-react'
import { track } from '../../lib/analytics'
import Button from './Button'
import IconBadge from './IconBadge'
import IconButton from './IconButton'
import Modal from './Modal'

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
  useEffect(() => {
    track('trial_started', { plan: tier }, { once: true })
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal onClose={onClose}>
      {(requestClose) => (
        <>
          <IconButton onClick={requestClose} aria-label="Close" className="absolute top-4 right-4">
            <X className="w-5 h-5" />
          </IconButton>

          <div className="text-center mb-6">
            <IconBadge icon={Zap} tone="brand" size="xl" className="mx-auto mb-5" />
            <h2 className="text-white font-bold text-xl mb-2">
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

          <Button onClick={requestClose} size="lg" className="w-full">
            Start exploring →
          </Button>
        </>
      )}
    </Modal>
  )
}
