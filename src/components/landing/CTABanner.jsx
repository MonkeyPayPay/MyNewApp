import { ArrowRight, Heart } from 'lucide-react'

export default function CTABanner({ onGetStarted }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Decorative orbs inside banner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative px-10 py-16 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Heart className="w-8 h-8 text-white fill-white animate-pulse-slow" />
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight">
              Your family is waiting for this.
            </h2>

            <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop letting caregiving overwhelm you. Start free today —
              no credit card needed, no complicated setup.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-2 bg-white text-indigo-700 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-white/60 text-sm">
                Free forever · No credit card · 2-min setup
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
