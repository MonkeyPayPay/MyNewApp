const scenarios = [
  {
    icon: '👨‍👩‍👧',
    title: 'The sibling coordination problem',
    body: "Three adult children, one aging parent, and an endless group text about who paid for what and who dropped the ball. CareCircle replaces the thread with one shared task board, one expense ledger, and one place everyone actually checks.",
  },
  {
    icon: '✈️',
    title: 'Caring for a parent from far away',
    body: "The sibling who lives 1,000 miles away can't be there for the appointment, but can see it happened, see the notes, and see that everyone's pitching in — without a nightly phone call recapping the day.",
  },
  {
    icon: '🧾',
    title: 'The sandwich generation, financially',
    body: "Prescriptions, groceries, gas for the visit, the copay nobody wrote down. Split expenses automatically across the family circle, export a clean record at tax time, and stop trying to remember who owes whom.",
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="orb w-[400px] h-[400px] bg-purple-700 bottom-0 right-[-10%] opacity-30" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-orange-300 text-sm font-medium">Built for the moments that matter</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
            Made for how families{' '}
            <span className="text-gradient">actually coordinate care</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Every feature exists because of a specific, common way caregiving falls apart without it.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="glass rounded-2xl p-7 card-hover flex flex-col gap-4"
            >
              <span className="text-3xl">{s.icon}</span>
              <h3 className="text-white font-bold text-lg">{s.title}</h3>
              <p className="text-slate-300 leading-relaxed text-sm flex-1">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Trust badges — only claims we can actually stand behind */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
          {[
            { label: 'Encrypted & Private', icon: '🔒' },
            { label: 'Free forever plan', icon: '🌱' },
            { label: 'No credit card to start', icon: '✅' },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 glass rounded-full px-5 py-2.5">
              <span className="text-lg">{badge.icon}</span>
              <span className="text-slate-300 text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
