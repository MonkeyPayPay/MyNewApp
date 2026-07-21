import { useState } from 'react'
import { CheckCircle, X, UserPlus, Mail } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import IconButton from '../ui/IconButton'
import IconBadge from '../ui/IconBadge'

// ── InviteModal ───────────────────────────────────────────────────────────────

export default function InviteModal({ can, onClose, onSend }) {
  const [email, setEmail]     = useState('')
  const [role, setRole]       = useState('member')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState(null)

  const canInviteProfessional = !can || can('professional_carer')

  async function handleSend() {
    if (!email.trim() || !email.includes('@')) return
    setSending(true)
    setError(null)
    const { error: err } = await onSend(email.trim(), role)
    setSending(false)
    if (err) { setError(err.message ?? 'Failed to send invite'); return }
    setSent(true)
  }

  return (
    <Modal onClose={onClose}>
      {(requestClose) => sent ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Invite sent!</h3>
          <p className="text-slate-400 text-sm mb-6">{email} will receive an email to join your circle.</p>
          <Button onClick={requestClose} className="w-full">Done</Button>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <IconBadge icon={UserPlus} tone="indigo" />
              <div>
                <h3 className="text-white font-bold text-lg">Invite family member</h3>
                <p className="text-slate-500 text-sm">They'll get an email to join your circle</p>
              </div>
            </div>
            <IconButton onClick={requestClose} aria-label="Close" className="-mr-2 -mt-1 flex-shrink-0">
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">Email address</label>
          <div className="relative mb-4">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="sibling@example.com"
              autoFocus
              className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/60 text-white placeholder:text-slate-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          {canInviteProfessional && (
            <>
              <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-widest">Invite as</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setRole('member')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${role === 'member' ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Family member
                </button>
                <button
                  onClick={() => setRole('caregiver')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${role === 'caregiver' ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                >
                  Professional caregiver
                </button>
              </div>
              {role === 'caregiver' && (
                <p className="text-slate-500 text-xs mb-4 bg-white/5 rounded-lg px-3 py-2">
                  They'll see tasks and the calendar only — no expenses, documents, or AI insights.
                </p>
              )}
            </>
          )}

          {error && <p className="text-rose-400 text-xs mb-4 bg-rose-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={requestClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleSend}
              disabled={!email.trim() || !email.includes('@')}
              loading={sending}
              className="flex-1"
            >
              {sending ? 'Sending…' : <><Mail className="w-4 h-4" /> Send Invite</>}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
