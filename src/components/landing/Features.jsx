import {
  ClipboardList, Calendar, DollarSign, FolderOpen, Brain, Users
} from 'lucide-react'

const features = [
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: 'Shared Task Board',
    description: 'Assign, track, and complete care tasks as a family. No more "I thought you were doing it."',
    color: 'from-indigo-500 to-indigo-600',
    glow: 'hover:shadow-indigo-500/20',
    tag: 'Most Popular',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: 'Unified Care Calendar',
    description: 'Doctor appointments, medication schedules, and recurring tasks — all visible to every family member.',
    color: 'from-purple-500 to-purple-600',
    glow: 'hover:shadow-purple-500/20',
    tag: null,
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: 'Expense Splitting',
    description: 'Log caregiving costs and split them fairly. One-click "settle up" transfers between siblings.',
    color: 'from-orange-500 to-orange-600',
    glow: 'hover:shadow-orange-500/20',
    tag: null,
  },
  {
    icon: <FolderOpen className="w-6 h-6" />,
    title: 'Document Vault',
    description: 'Living wills, insurance cards, medication lists, and POA documents — securely stored and always accessible.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'hover:shadow-emerald-500/20',
    tag: null,
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'AI Care Advisor',
    description: '"Mom\'s had 3 falls this month — 200% increase. Consider requesting a fall risk assessment." Patterns you\'d miss, surfaced automatically.',
    color: 'from-pink-500 to-rose-600',
    glow: 'hover:shadow-pink-500/20',
    tag: 'AI-Powered',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Care Log & Feed',
    description: 'Every visit, call, and observation logged in a shared timeline. Never repeat yourself or lose context.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'hover:shadow-cyan-500/20',
    tag: null,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-indigo-700 top-[10%] left-[-20%]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-indigo-300 text-sm font-medium">Everything in one place</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
            One app. Zero{' '}
            <span className="text-gradient">coordination chaos.</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Every tool a caregiving family needs, beautifully integrated — so you spend
            less time managing and more time caring.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`glass rounded-2xl p-6 card-hover group hover:shadow-2xl ${feature.glow} transition-all duration-300 relative overflow-hidden`}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative">
                {feature.tag && (
                  <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full mb-4 bg-gradient-to-r ${feature.color} text-white`}>
                    {feature.tag}
                  </span>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-5 shadow-lg`}>
                  {feature.icon}
                </div>

                <h3 className="text-white font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
