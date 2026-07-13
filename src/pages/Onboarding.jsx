import { useState } from 'react'
import { Heart, User, Mail, ArrowRight, ArrowLeft, CheckCircle, Plus, X, Users, HeartHandshake } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCircle } from '../hooks/useCircle'
import { supabase } from '../lib/supabase'
import { track } from '../lib/analytics'

const STEPS = ['Who you are', 'Your name', 'Care recipient', 'Invite family', 'You\'re set']

const ROLES = [
  {
    value: 'caregiver',
    icon: <User className="w-5 h-5" />,
    title: "I'm coordinating care for a family member",
    body: 'You\'ll set up the circle, add tasks, and invite others to help.',
  },
  {
    value: 'helper',
    icon: <Users className="w-5 h-5" />,
    title: "I'm helping a family member coordinate",
    body: 'You\'ll pitch in on tasks alongside whoever\'s leading.',
  },
  {
    value: 'recipient',
    icon: <HeartHandshake className="w-5 h-5" />,
    title: "I'm the person receiving care",
    body: 'You\'ll get a simpler view — just today\'s meds and how you\'re feeling.',
  },
]

export default function Onboarding({ onComplete }) {
  const { user } = useAuth()
  const { createCircle, inviteMember } = useCircle()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [careRole, setCareRole] = useState(null)
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [recipientName, setRecipientName] = useState('')
  const [recipientDob, setRecipientDob] = useState('')
  const [inviteEmails, setInviteEmails] = useState([''])
  const [circleId, setCircleId] = useState(null)

  const isRecipient = careRole === 'recipient'

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  function chooseRole(value) {
    setCareRole(value)
    next()
  }

  async function handleCreateCircle() {
    setLoading(true)
    setError(null)
    // Persist name + role to profile
    if (name.trim()) {
      await supabase.from('profiles').upsert({ id: user.id, full_name: name.trim(), care_role: careRole })
    }
    const { circle, error } = await createCircle({
      recipientName: isRecipient ? name.trim() : recipientName,
      recipientDob: recipientDob || null,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setCircleId(circle.id)
      track('circle_created')
      next()
    }
  }

  async function handleInvites() {
    setLoading(true)
    const valid = inviteEmails.filter(e => e.trim() && e.includes('@'))
    await Promise.all(valid.map(email => inviteMember(email.trim())))
    setLoading(false)
    next()
  }

  const addEmailField = () => setInviteEmails(prev => [...prev, ''])
  const removeEmailField = (i) => setInviteEmails(prev => prev.filter((_, idx) => idx !== i))
  const updateEmail = (i, val) => setInviteEmails(prev => prev.map((e, idx) => idx === i ? val : e))

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb w-[500px] h-[500px] bg-indigo-700 top-[-150px] left-[-150px]" />
      <div className="orb w-[400px] h-[400px] bg-purple-700 bottom-[-100px] right-[-100px]" />

      <div className="relative w-full max-w-lg animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-white font-bold text-lg">CareCircle</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/30' :
                'bg-white/10 text-slate-500'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded transition-all ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8 border border-white/8">
          {/* Step 0: Who you are */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="text-white font-black text-2xl mb-2">Which best describes you?</h2>
              <p className="text-slate-400 text-sm mb-7">This just helps us show you the right amount of detail.</p>
              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => chooseRole(role.value)}
                    className="w-full flex items-start gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 rounded-xl p-4 text-left transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      {role.icon}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{role.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{role.body}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Your name */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-white font-black text-2xl mb-2">Welcome! What's your name?</h2>
              <p className="text-slate-400 text-sm mb-7">So your family knows who's doing what.</p>
              <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jordan O'Brien"
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-slate-600 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors mb-6"
              />
              <div className="flex gap-3">
                <button onClick={back} className="glass px-5 py-3.5 rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  disabled={!name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Care recipient (reframed to first-person if the user is the recipient) */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-white font-black text-2xl mb-2">
                {isRecipient ? 'A couple details about you' : 'Who are you caring for?'}
              </h2>
              <p className="text-slate-400 text-sm mb-7">
                {isRecipient
                  ? 'This helps your family circle keep track of your care.'
                  : 'Add your loved one\'s name to create your care circle.'}
              </p>

              {!isRecipient && (
                <>
                  <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">Full name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="e.g. Betty Johnson"
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-slate-600 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors mb-4"
                  />
                </>
              )}

              <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">Date of birth (optional)</label>
              <input
                type="date"
                value={recipientDob}
                onChange={e => setRecipientDob(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-slate-600 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors mb-6"
              />

              {error && (
                <p className="text-rose-400 text-xs mb-4 bg-rose-500/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <button onClick={back} className="glass px-5 py-3.5 rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCreateCircle}
                  disabled={(!isRecipient && !recipientName.trim()) || loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all"
                >
                  {loading ? 'Creating...' : <>Create Care Circle <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Invite family */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-white font-black text-2xl mb-2">Invite your family</h2>
              <p className="text-slate-400 text-sm mb-7">They'll get an email to join your care circle. You can add more later.</p>

              <div className="space-y-3 mb-4">
                {inviteEmails.map((email, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => updateEmail(i, e.target.value)}
                        placeholder="sibling@example.com"
                        className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
                      />
                    </div>
                    {inviteEmails.length > 1 && (
                      <button onClick={() => removeEmailField(i)} className="text-slate-600 hover:text-rose-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addEmailField}
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium mb-6 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add another person
              </button>

              <div className="flex gap-3">
                <button onClick={back} className="glass px-5 py-3.5 rounded-xl text-slate-400 hover:text-white transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleInvites}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-all"
                >
                  {loading ? 'Sending invites...' : <>Send Invites <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>

              <button
                onClick={next}
                className="w-full text-slate-500 hover:text-slate-400 text-sm py-3 mt-2 transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 4 && (
            <div className="text-center animate-fade-in py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-indigo-500/30">
                <Heart className="w-10 h-10 text-white fill-white animate-pulse-slow" />
              </div>
              <h2 className="text-white font-black text-2xl mb-3">Your circle is ready!</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Invites have been sent. Your family can now coordinate care for your loved one — together.
              </p>
              <button
                onClick={onComplete}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl text-sm transition-all"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
