import { useState } from 'react'
import { Heart, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import IconBadge from '../components/ui/IconBadge'

export default function Auth() {
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleEmail(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError(null)
    const { error } = await signInWithEmail(email)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  async function handleGoogle() {
    setError(null)
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-indigo-700 top-[-150px] left-[-150px]" />
      <div className="orb w-[400px] h-[400px] bg-purple-700 bottom-[-100px] right-[-100px]" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <IconBadge icon={Heart} tone="brand" size="lg" iconClassName="fill-white" className="mx-auto mb-4 shadow-xl shadow-indigo-500/30" />
          <h1 className="text-white font-black text-2xl tracking-tight">CareCircle</h1>
          <p className="text-slate-400 text-sm mt-1">The family command center for elder care</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-white font-bold text-xl mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                We sent a magic link to <span className="text-white font-medium">{email}</span>.
                Click it to sign in — no password needed.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-indigo-400 text-sm hover:text-indigo-300 transition-colors"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-bold text-xl mb-1">Sign in to CareCircle</h2>
              <p className="text-slate-400 text-sm mb-7">Start free · No credit card required</p>

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-800 font-semibold h-12 rounded-xl text-sm transition-all duration-200 mb-4"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-slate-600 text-xs">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email magic link */}
              <form onSubmit={handleEmail}>
                <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">
                  Email address
                </label>
                <div className="relative mb-4">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-slate-600 rounded-xl pl-10 pr-4 py-3.5 text-sm outline-none transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-rose-400 text-xs mb-4 bg-rose-500/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <Button type="submit" disabled={!email} loading={loading} className="w-full group">
                  {loading ? 'Sending...' : <>Send Magic Link <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                </Button>
              </form>

              <p className="text-slate-600 text-xs text-center mt-5">
                By signing in you agree to our{' '}
                <a href="#" className="text-slate-500 hover:text-slate-400">Terms</a> and{' '}
                <a href="#" className="text-slate-500 hover:text-slate-400">Privacy Policy</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
