import { useState, useEffect } from 'react'
import { Heart, Users, CheckCircle, AlertCircle, Loader, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { track } from '../lib/analytics'
import Button from '../components/ui/Button'
import IconBadge from '../components/ui/IconBadge'

export default function JoinCircle({ token, onComplete }) {
  const [preview,  setPreview]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [joining,  setJoining]  = useState(false)
  const [joined,   setJoined]   = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    supabase.rpc('preview_invitation', { p_token: token }).then(({ data, error: err }) => {
      if (err) { setError(err.message) }
      else if (data?.error) { setError(data.error) }
      else { setPreview(data) }
      setLoading(false)
    })
  }, [token])

  async function handleJoin() {
    setJoining(true)
    setError(null)
    const { data, error: err } = await supabase.rpc('accept_invitation', { p_token: token })
    if (err) { setError(err.message); setJoining(false) }
    else if (data?.error) { setError(data.error); setJoining(false) }
    else { setJoined(true); track('invite_accepted') }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-indigo-700 top-[-150px] left-[-150px]" />
      <div className="orb w-[400px] h-[400px] bg-purple-700 bottom-[-100px] right-[-100px]" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-8">
          <IconBadge icon={Heart} tone="brand" size="xs" iconClassName="fill-white" />
          <span className="text-white font-bold text-lg">CareCircle</span>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {loading && (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Loading invitation…</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-4">
              <IconBadge icon={AlertCircle} tone="rose" size="lg" className="mx-auto mb-4" />
              <h2 className="text-white font-bold text-xl mb-2">Invitation not found</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">{error}</p>
              <a href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                Go to CareCircle →
              </a>
            </div>
          )}

          {!loading && !error && !joined && preview && (
            <div className="animate-fade-in">
              <IconBadge icon={Users} tone="indigo" size="xl" className="mx-auto mb-5" />
              <h2 className="text-white font-black text-2xl text-center mb-2">You're invited!</h2>
              <p className="text-slate-400 text-sm text-center mb-6 leading-relaxed">
                <span className="text-white font-semibold">{preview.inviter_name}</span> invited you to help care for{' '}
                <span className="text-white font-semibold">{preview.recipient_name}</span>.
              </p>

              <div className="space-y-2.5 mb-7">
                {[
                  ['📋', 'Shared task board — nothing falls through'],
                  ['📅', 'Unified care calendar with appointments'],
                  ['💰', 'Expense tracking and fair cost splitting'],
                  ['📁', 'Secure document vault for key paperwork'],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                    <span className="text-lg">{icon}</span>
                    <span className="text-slate-300 text-sm">{text}</span>
                  </div>
                ))}
              </div>

              <Button onClick={handleJoin} loading={joining} size="lg" className="w-full">
                {joining ? 'Joining…' : <>Join Care Circle <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          )}

          {joined && (
            <div className="text-center py-4 animate-fade-in">
              <IconBadge icon={CheckCircle} tone="emerald" size="xl" iconClassName="fill-white" className="mx-auto mb-5 shadow-xl shadow-emerald-500/30" />
              <h2 className="text-white font-black text-2xl mb-3">You're in!</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Welcome to the circle. You can now coordinate care with your family.
              </p>
              <Button onClick={onComplete} size="lg" className="w-full">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
