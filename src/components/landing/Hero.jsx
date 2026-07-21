import { ArrowRight, Play, CheckCircle, FileText, DollarSign } from 'lucide-react'

const mockFeedItems = [
  { icon: '💊', text: 'Medication logged — Lisinopril 10mg', time: '2m ago', color: 'text-emerald-400' },
  { icon: '📅', text: 'Dr. Chen appointment confirmed', time: '1h ago', color: 'text-indigo-400' },
  { icon: '✅', text: 'Sarah completed grocery run', time: '3h ago', color: 'text-purple-400' },
  { icon: '💬', text: 'Mom had a great day, walked 20 mins', time: '5h ago', color: 'text-orange-400' },
]

const mockTasks = [
  { label: 'Pick up prescriptions', who: 'Michael', done: true },
  { label: 'Schedule physical therapy', who: 'Sarah', done: false },
  { label: 'Review insurance EOB', who: 'You', done: false },
]

export default function Hero({ onGetStarted }) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-indigo-600 top-[-200px] left-[-200px]" />
      <div className="orb w-[500px] h-[500px] bg-purple-600 bottom-[-100px] right-[-100px]" />
      <div className="orb w-[300px] h-[300px] bg-orange-500 top-[30%] right-[20%] opacity-20" />

      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
              <span className="text-indigo-300 text-sm font-medium">Free to start — no credit card</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Your family,{' '}
              <span className="text-gradient">coordinated.</span>
              <br />
              Your parent,{' '}
              <span className="text-gradient">cared for.</span>
            </h1>

            <p className="text-slate-400 text-xl leading-relaxed mb-10 max-w-xl">
              CareCircle is the family command center for elder care. One beautiful app
              to coordinate tasks, share care updates, track expenses, and never miss
              what matters — together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="group flex items-center justify-center gap-2 bg-brand bg-brand-hover text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Start Free — No Credit Card
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="flex items-center justify-center gap-2 glass text-white font-semibold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-all duration-200">
                <Play className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              {[
                '53M caregivers in the US',
                'Free forever plan',
                'Encrypted & private',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-400 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: App Mockup */}
          <div className="hidden lg:block animate-float relative">
            <div className="relative">
              {/* Glow behind the card */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-3xl blur-3xl scale-105" />

              {/* Main dashboard card */}
              <div className="relative glass rounded-3xl p-6 glow-purple">
                {/* Dashboard header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">Mom's Care Dashboard</p>
                    <h3 className="text-white font-bold text-lg">Betty Johnson, 78</h3>
                  </div>
                  <div className="flex -space-x-2">
                    {['M', 'S', 'J'].map((initial, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-ink-950 ${
                          i === 0 ? 'bg-indigo-500' : i === 1 ? 'bg-purple-500' : 'bg-orange-500'
                        } text-white`}
                      >
                        {initial}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-ink-950 bg-slate-700 text-slate-300">
                      +1
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Tasks Today', value: '4', icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
                    { label: 'This Week', value: '$234', icon: <DollarSign className="w-3.5 h-3.5" />, color: 'text-orange-400' },
                    { label: 'Documents', value: '12', icon: <FileText className="w-3.5 h-3.5" />, color: 'text-indigo-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-2xl p-3">
                      <div className={`flex items-center gap-1 ${stat.color} mb-1`}>
                        {stat.icon}
                        <span className="text-xs font-medium">{stat.label}</span>
                      </div>
                      <p className="text-white font-bold text-xl">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Care Feed */}
                <div className="mb-5">
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-3">Recent Activity</p>
                  <div className="space-y-2.5">
                    {mockFeedItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-200 text-sm font-medium truncate">{item.text}</p>
                          <p className="text-slate-500 text-xs">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks mini */}
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-3">Tasks</p>
                  <div className="space-y-2">
                    {mockTasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                          {task.done && <CheckCircle className="w-3 h-3 text-white fill-white" />}
                        </div>
                        <span className={`text-sm flex-1 ${task.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.label}
                        </span>
                        <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">{task.who}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl animate-pulse-slow">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <span className="text-sm">💊</span>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Medication Reminder</p>
                  <p className="text-slate-400 text-xs">Evening meds — 7:00 PM</p>
                </div>
              </div>

              {/* Floating expense badge */}
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-sm">✓</span>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">$45 reimbursement sent</p>
                  <p className="text-slate-400 text-xs">Sarah → Michael</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
