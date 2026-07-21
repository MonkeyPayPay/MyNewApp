import { UserPlus, Users, Heart } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <UserPlus className="w-7 h-7" />,
    title: 'Create your care circle',
    description: 'Sign up and add your loved one. Takes 60 seconds — no credit card required.',
    color: 'from-indigo-500 to-indigo-600',
  },
  {
    number: '02',
    icon: <Users className="w-7 h-7" />,
    title: 'Invite your family',
    description: 'Send a link to siblings, partners, and professional caregivers. Everyone joins in one tap.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    number: '03',
    icon: <Heart className="w-7 h-7" />,
    title: 'Care, together',
    description: 'Coordinate tasks, log care moments, split expenses, and let AI surface what matters most.',
    color: 'from-orange-500 to-coral-500',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-purple-300 text-sm font-medium">Simple by design</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
            Up and running in{' '}
            <span className="text-gradient">under 5 minutes</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            No training. No complexity. Just your family, finally on the same page.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 relative">
          {/* Connector lines for desktop */}
          <div className="hidden lg:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />

          {steps.map((step, i) => (
            <div key={step.number} className="relative text-center group">
              {/* Step number */}
              <div className="relative inline-block mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-ink-950 border-2 border-white/10 flex items-center justify-center">
                  <span className="text-slate-400 text-xs font-bold">{i + 1}</span>
                </div>
              </div>

              <div className="text-slate-600 font-black text-7xl absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 select-none pointer-events-none opacity-5">
                {step.number}
              </div>

              <h3 className="text-white font-bold text-xl mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
