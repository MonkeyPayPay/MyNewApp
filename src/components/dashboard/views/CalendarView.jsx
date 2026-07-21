import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, ChevronRight, ChevronLeft, Trash2, Paperclip } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useAppointments } from '../../../hooks/useAppointments'
import { useDocuments } from '../../../hooks/useDocuments'
import { getDocumentSignedUrl } from '../../../lib/documentStorage'
import { fadeSlideUp } from '../../../lib/motion'
import Button from '../../ui/Button'
import IconButton from '../../ui/IconButton'
import Modal from '../../ui/Modal'

// ── CalendarView ──────────────────────────────────────────────────────────────

export default function CalendarView({ circleId, can }) {
  const { user }  = useAuth()
  const { appointments, loading, addAppointment, deleteAppointment } = useAppointments(circleId)

  async function viewDocument(doc) {
    const { url } = await getDocumentSignedUrl(doc.file_path)
    if (url) window.open(url, '_blank', 'noopener')
  }
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d
  })
  const [selectedDay, setSelectedDay] = useState(null)
  const [showModal, setShowModal]     = useState(false)

  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDow  = new Date(year, month, 1).getDay()
  const daysCount = new Date(year, month + 1, 0).getDate()
  const cells     = [...Array(firstDow).fill(null), ...Array.from({ length: daysCount }, (_, i) => i + 1)]

  const apptMap = {}
  for (const a of appointments) {
    const key = new Date(a.starts_at).toLocaleDateString('en-CA')
    if (!apptMap[key]) apptMap[key] = []
    apptMap[key].push(a)
  }

  const selectedKey = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null
  const selectedAppts = selectedKey ? (apptMap[selectedKey] ?? []) : []

  const todayKey = new Date().toLocaleDateString('en-CA')

  const upcoming = appointments.filter(a => new Date(a.starts_at) >= new Date()).slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Calendar</h2>
          <p className="text-slate-500 text-sm">Appointments, visits, and care events</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add Appointment
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Month grid */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <IconButton onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} aria-label="Previous month">
              <ChevronLeft className="w-5 h-5" />
            </IconButton>
            <h3 className="text-white font-bold text-lg">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <IconButton onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} aria-label="Next month">
              <ChevronRight className="w-5 h-5" />
            </IconButton>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-slate-600 text-xs font-medium pb-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`} />
              const key     = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasAppt = !!apptMap[key]
              const isSel   = selectedDay === day
              const isToday = key === todayKey
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`relative aspect-square min-h-11 flex flex-col items-center justify-start pt-1.5 rounded-xl text-sm font-medium transition-all ${
                    isSel    ? 'bg-indigo-600 text-white'
                    : isToday ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {day}
                  {hasAppt && <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-indigo-400'}`} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Day panel */}
        <div className="glass rounded-2xl p-5">
          <AnimatePresence mode="wait" initial={false}>
            {selectedDay ? (
              <motion.div key={selectedKey} {...fadeSlideUp}>
                <h3 className="text-white font-bold mb-1">
                  {new Date(year, month, selectedDay).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-slate-500 text-xs mb-5">{selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''}</p>

                {selectedAppts.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-600 text-sm">Nothing scheduled</p>
                    <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 text-xs mt-3 font-medium transition-colors">Add appointment →</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAppts.map(appt => (
                      <div key={appt.id} className="bg-white/5 rounded-xl p-4 group">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-white font-semibold text-sm">{appt.title}</p>
                          {appt.created_by === user?.id && (
                            <IconButton
                              onClick={() => deleteAppointment(appt.id)}
                              variant="danger"
                              aria-label={`Delete ${appt.title}`}
                              className="opacity-40 group-hover:opacity-100 flex-shrink-0 -mt-2 -mr-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </IconButton>
                          )}
                        </div>
                        <p className="text-indigo-400 text-xs mt-1">
                          {new Date(appt.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {appt.ends_at && ` – ${new Date(appt.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </p>
                        {appt.location && <p className="text-slate-500 text-xs mt-1.5">📍 {appt.location}</p>}
                        {appt.notes && <p className="text-slate-500 text-xs mt-2 leading-relaxed">{appt.notes}</p>}
                        {appt.document && (
                          <button
                            onClick={() => viewDocument(appt.document)}
                            className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-xs mt-2 transition-colors"
                          >
                            <Paperclip className="w-3 h-3" /> {appt.document.name}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" {...fadeSlideUp} className="text-center py-12">
                <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Select a date</p>
                <p className="text-slate-600 text-xs mt-1">Tap any day to see or add appointments</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upcoming list */}
      {upcoming.length > 0 && (
        <div className="mt-6 glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Upcoming</h3>
          <div className="space-y-3">
            {upcoming.map(appt => (
              <div key={appt.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-3">
                <div className="text-center flex-shrink-0 w-12">
                  <p className="text-indigo-400 text-xs font-bold uppercase">
                    {new Date(appt.starts_at).toLocaleDateString('en-US', { month: 'short' })}
                  </p>
                  <p className="text-white font-black text-xl leading-none">{new Date(appt.starts_at).getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{appt.title}</p>
                  <p className="text-slate-500 text-xs">
                    {new Date(appt.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {appt.location && ` · ${appt.location}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[1,2].map(n => <div key={n} className="glass rounded-2xl h-14 animate-pulse" />)}
        </div>
      )}

      {showModal && (
        <AddAppointmentModal
          defaultDateKey={selectedKey}
          circleId={circleId}
          can={can}
          onClose={() => setShowModal(false)}
          onSave={async (d) => { await addAppointment(d); setShowModal(false) }}
        />
      )}
    </div>
  )
}

function AddAppointmentModal({ defaultDateKey, circleId, can, onClose, onSave }) {
  const defaultStart = defaultDateKey ? `${defaultDateKey}T09:00` : new Date().toISOString().slice(0, 16)
  const [title,    setTitle]    = useState('')
  const [startsAt, setStartsAt] = useState(defaultStart)
  const [endsAt,   setEndsAt]   = useState('')
  const [location, setLocation] = useState('')
  const [notes,    setNotes]    = useState('')
  const [documentId, setDocumentId] = useState('')
  const [saving,   setSaving]   = useState(false)

  const canLinkDocument = !can || can('documents')
  const { documents } = useDocuments(canLinkDocument ? circleId : null)

  async function handleSave() {
    if (!title.trim() || !startsAt) return
    setSaving(true)
    await onSave({
      title:    title.trim(),
      starts_at: new Date(startsAt).toISOString(),
      ends_at:  endsAt ? new Date(endsAt).toISOString() : null,
      document_id: documentId || null,
      location: location.trim() || null,
      notes:    notes.trim() || null,
    })
    setSaving(false)
  }

  return (
    <Modal onClose={onClose} title="New Appointment">
      {(requestClose) => (
        <>
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Dr. Chen Annual Checkup" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Starts</label>
                <input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Ends (optional)</label>
                <input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]" />
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Mayo Clinic, 200 First St SW" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>

            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Preparation notes, what to bring, etc." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>

            {canLinkDocument && documents.length > 0 && (
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Attach a document (optional)</label>
                <div className="relative">
                  <Paperclip className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select
                    value={documentId}
                    onChange={e => setDocumentId(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all"
                  >
                    <option value="" className="bg-ink-900">None</option>
                    {documents.map(doc => (
                      <option key={doc.id} value={doc.id} className="bg-ink-900">{doc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={requestClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={!title.trim() || !startsAt} loading={saving} className="flex-1">
              {saving ? 'Saving…' : 'Save Appointment'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
