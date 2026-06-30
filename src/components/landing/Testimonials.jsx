import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah M.',
    role: 'Daughter, caring for mom with dementia',
    location: 'Chicago, IL',
    avatar: 'S',
    color: 'from-indigo-500 to-purple-600',
    quote: "Before CareCircle, my three siblings and I were constantly arguing about who paid for what and who dropped the ball. Now we have one place to see everything. The AI even caught that Mom's doctor visits were increasing before we did.",
    rating: 5,
  },
  {
    name: 'David K.',
    role: 'Son managing care from 1,000 miles away',
    location: 'Austin, TX',
    avatar: 'D',
    color: 'from-orange-500 to-pink-600',
    quote: "I live across the country but I feel like I'm there. Every morning I check the care feed and know exactly how Dad's doing. The expense splitter alone saves us a family argument every month.",
    rating: 5,
  },
  {
    name: 'Maria L.',
    role: 'Primary caregiver for both parents',
    location: 'Miami, FL',
    avatar: 'M',
    color: 'from-emerald-500 to-teal-600',
    quote: "I was drowning in sticky notes, group texts, and forgotten appointments. CareCircle gave me my sanity back. My brother finally feels included and my parents get better care. This app changed everything.",
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative">
      <div className="orb w-[400px] h-[400px] bg-purple-700 bottom-0 right-[-10%] opacity-30" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-orange-300 text-sm font-medium">Real families, real results</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
            Families love{' '}
            <span className="text-gradient">CareCircle</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Join thousands of families who've replaced chaos with calm.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="glass rounded-2xl p-7 card-hover flex flex-col gap-5"
            >
              {/* Rating */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote icon */}
              <Quote className="w-8 h-8 text-indigo-500/50 -mb-2" />

              {/* Testimonial */}
              <p className="text-slate-300 leading-relaxed text-sm flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                  <p className="text-slate-600 text-xs">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
          {[
            { label: 'HIPAA Ready', icon: '🔒' },
            { label: '4.9/5 App Store', icon: '⭐' },
            { label: '50,000+ families', icon: '👨‍👩‍👧‍👦' },
            { label: '24/7 Support', icon: '💬' },
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
