import { useState } from 'react'
import { Plus, Activity, MessageSquare, X, Trash2, Loader } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useCareFeed } from '../../../hooks/useCareFeed'
import { CATEGORY_META } from '../dashboardConstants'
import { timeAgo } from '../../../lib/dateFormat'

// ── FeedView ──────────────────────────────────────────────────────────────────

export default function FeedView({ circleId }) {
  const { user }  = useAuth()
  const { entries, loading, addEntry, deleteEntry } = useCareFeed(circleId)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Care Feed</h2>
          <p className="text-slate-500 text-sm">Every care moment, shared with the whole family</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </div>

      {loading && [1,2,3].map(n => (
        <div key={n} className="glass rounded-2xl p-5 mb-4 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-1/4" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}

      {!loading && entries.length === 0 && (
        <div className="glass rounded-2xl p-16 text-center border border-white/5">
          <Activity className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No entries yet</p>
          <p className="text-slate-500 text-sm mb-5">Start logging care activities to keep the whole family in sync.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Log the first entry →</button>
        </div>
      )}

      <div className="space-y-4">
        {entries.map((item, i) => {
          const meta  = CATEGORY_META[item.category] ?? CATEGORY_META.note
          const isOwn = item.author_id === user?.id
          return (
            <div key={item.id} className="glass rounded-2xl p-5 card-hover animate-slide-up group" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-start gap-4">
                <div className="text-2xl">{meta.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                    <span className="text-slate-500 text-xs">{item.profiles?.full_name ?? 'Someone'} · {timeAgo(item.created_at)}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{item.body}</p>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <button className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-400 text-xs transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" /> Reply
                    </button>
                    {isOwn && (
                      <button onClick={() => deleteEntry(item.id)} className="flex items-center gap-1.5 text-slate-600 hover:text-rose-400 text-xs transition-colors ml-auto opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && <LogEntryModal onClose={() => setShowModal(false)} onSave={async (d) => { await addEntry(d); setShowModal(false) }} />}
    </div>
  )
}

function LogEntryModal({ onClose, onSave }) {
  const [category, setCategory] = useState('note')
  const [body, setBody]         = useState('')
  const [saving, setSaving]     = useState(false)

  async function handleSave() {
    if (!body.trim()) return
    setSaving(true)
    await onSave({ category, body: body.trim() })
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Log Care Entry</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-slate-500 text-xs uppercase tracking-widest font-medium mb-3">Category</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium border transition-all ${
                category === key
                  ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300'
                  : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{meta.icon}</span>
              {meta.label}
            </button>
          ))}
        </div>

        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="What happened? Describe the care activity..."
          rows={4}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-all mb-5"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 text-sm font-medium hover:bg-white/5 transition-all">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!body.trim() || saving}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader className="w-4 h-4 animate-spin" /> Saving…</> : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}

