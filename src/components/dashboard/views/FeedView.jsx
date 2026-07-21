import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Activity, Trash2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useCareFeed } from '../../../hooks/useCareFeed'
import { CATEGORY_META } from '../dashboardConstants'
import { timeAgo } from '../../../lib/dateFormat'
import { fadeSlideUp } from '../../../lib/motion'
import Button from '../../ui/Button'
import IconButton from '../../ui/IconButton'
import Card from '../../ui/Card'
import Modal from '../../ui/Modal'

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
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Log Entry
        </Button>
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
        <Card padding="p-16" className="text-center">
          <Activity className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No entries yet</p>
          <p className="text-slate-500 text-sm mb-5">Start logging care activities to keep the whole family in sync.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Log the first entry →</button>
        </Card>
      )}

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {entries.map((item) => {
            const meta  = CATEGORY_META[item.category] ?? CATEGORY_META.note
            const isOwn = item.author_id === user?.id
            return (
              <motion.div key={item.id} layout {...fadeSlideUp} className="glass rounded-2xl p-5 card-hover group">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{meta.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>{meta.label}</span>
                      <span className="text-slate-500 text-xs">{item.profiles?.full_name ?? 'Someone'} · {timeAgo(item.created_at)}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{item.body}</p>
                  </div>
                  {isOwn && (
                    <IconButton
                      onClick={() => deleteEntry(item.id)}
                      variant="danger"
                      aria-label="Delete entry"
                      className="opacity-0 group-hover:opacity-100 flex-shrink-0 -mt-2 -mr-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
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
    <Modal onClose={onClose} title="Log Care Entry">
      {(requestClose) => (
        <>
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
            <Button variant="secondary" onClick={requestClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={!body.trim()} loading={saving} className="flex-1">
              {saving ? 'Saving…' : 'Save Entry'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
