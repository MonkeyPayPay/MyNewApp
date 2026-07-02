import { Check, Zap, Shield } from 'lucide-react'
import { useState } from 'react'
import { useSubscription } from '../../hooks/useSubscription'

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for getting started',
    color: 'border-white/10',
    buttonStyle: 'bg-white/10 hover:bg-white/20 text-white',
    tag: null,
    features: [
      '1 care recipient',
      'Up to 3 family members',
      '30-day care log',
      'Basic task board',
      'Shared calendar',
      'Mobile app access',
    ],
    missing: [
      'Document vault',
      'Expense splitting',
      'AI Care Advisor',
      'Professional caregivers',
    ],
  },
  {
    name: 'Family',
    price: { monthly: 12.99, annual: 9.99 },
    description: 'The complete family solution',
    color: 'border-indigo-500/50',
    buttonStyle: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25',
    tag: 'Most Popular',
    features: [
      'Unlimited family members',
      'Up to 3 care recipients',
      'Full care log history',
      'Document vault (500MB)',
      'Expense splitting & export',
      'AI Care Advisor',
      'Priority email support',
      'Mobile + desktop apps',
    ],
    missing: [
      'Professional caregiver access',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 29.99, annual: 24.99 },
    description: 'For complex care situations',
    color: 'border-orange-500/30',
    buttonStyle: 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-400 hover:to-pink-500 text-white',
    tag: null,
    features: [
      'Everything in Family',
      'Unlimited care recipients',
      'Professional caregiver portal',
      'Medication interaction alerts',
      'Health records integration',
      'Document vault (5GB)',
      'Care summary reports for doctors',
      'Phone support',
      'Custom care plans',
      'Insurance claim assistant',
    ],
    missing: [],
  },
]

export default function Pricing({ onGetStarted, onGetStartedWithPlan }) {
  const [annual, setAnnual] = useState(true)
  const { tier, startCheckout } = useSubscription()

  async function handlePlanClick(plan) {
    if (plan.name === 'Free') { onGetStarted(); return }
    const interval = annual ? 'annual' : 'monthly'
    const planTier = plan.name.toLowerCase()
    // Authenticated user on free tier → go straight to Stripe
    if (tier !== 'free') { onGetStarted(); return }
    try {
      await startCheckout(planTier, interval)
    } catch {
      // Not authenticated — save intent and show sign-up; checkout resumes after auth
      if (onGetStartedWithPlan) onGetStartedWithPlan(planTier, interval)
      else onGetStarted()
    }
  }

  return (
    <section id="pricing" className="py-24 relative">
      <div className="orb w-[500px] h-[500px] bg-indigo-700 top-0 left-[-10%]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-emerald-300 text-sm font-medium">Simple, transparent pricing</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
            Start free.{' '}
            <span className="text-gradient">Upgrade when ready.</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
            No surprise fees. Cancel anytime. Free plan is free forever.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 glass rounded-2xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !annual ? 'bg-white text-slate-900' : 'text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                annual ? 'bg-white text-slate-900' : 'text-slate-400'
              }`}
            >
              Annual
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
                Save 23%
              </span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative glass rounded-2xl p-7 border ${plan.color} ${
                plan.tag ? 'lg:-mt-4 lg:pb-11 ring-1 ring-indigo-500/30' : ''
              }`}
            >
              {plan.tag && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3 fill-white" />
                    {plan.tag}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white font-black text-5xl">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-slate-400 text-sm">/month</span>
                  )}
                  {plan.price.monthly === 0 && (
                    <span className="text-slate-400 text-sm">forever</span>
                  )}
                </div>
                {annual && plan.price.monthly > 0 && (
                  <p className="text-emerald-400 text-xs mt-1 font-medium">
                    Billed annually — save ${((plan.price.monthly - plan.price.annual) * 12).toFixed(0)}/year
                  </p>
                )}
              </div>

              <button
                onClick={() => handlePlanClick(plan)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 mb-7 ${plan.buttonStyle}`}
              >
                {plan.price.monthly === 0 ? 'Get Started Free' : `Start ${plan.name} — 14-day trial`}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.missing.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 opacity-30">
                    <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-slate-600 text-xs font-bold">—</span>
                    <span className="text-slate-500 text-sm line-through">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-8 glass rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              <Shield className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h3 className="text-white font-bold">Enterprise & Healthcare</h3>
              <p className="text-slate-400 text-sm">For senior living facilities, hospital discharge teams, and home care agencies</p>
            </div>
          </div>
          <button className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  )
}
