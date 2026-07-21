import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Plus, X, Trash2, Download, FileImage, Camera } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useExpenses } from '../../../hooks/useExpenses'
import { EXPENSE_CATS, EXPENSE_ICONS } from '../dashboardConstants'
import { fmtDate } from '../../../lib/dateFormat'
import { buildExpensesCsv } from '../../../lib/csv'
import { getDocumentSignedUrl, uploadDocumentFile } from '../../../lib/documentStorage'
import { fadeSlideUp } from '../../../lib/motion'
import Button from '../../ui/Button'
import IconButton from '../../ui/IconButton'
import Card from '../../ui/Card'
import Modal from '../../ui/Modal'

// ── ExpensesView ──────────────────────────────────────────────────────────────

export default function ExpensesView({ circleId, members, can }) {
  const { user }  = useAuth()
  const { expenses, loading, addExpense, deleteExpense } = useExpenses(circleId)
  const [showModal, setShowModal] = useState(false)

  async function viewReceipt(doc) {
    const { url } = await getDocumentSignedUrl(doc.file_path)
    if (url) window.open(url, '_blank', 'noopener')
  }

  const thisMonth   = new Date().toISOString().slice(0, 7)
  const monthExp    = expenses.filter(e => e.expense_date?.startsWith(thisMonth))
  const monthTotal  = monthExp.reduce((s, e) => s + e.amount_cents, 0)
  const myTotal     = monthExp.filter(e => e.paid_by === user?.id).reduce((s, e) => s + e.amount_cents, 0)

  function exportCSV() {
    const csv  = buildExpensesCsv(expenses)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Expenses</h2>
          <p className="text-slate-500 text-sm">Track, split, and settle caregiving costs</p>
        </div>
        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <Button variant="secondary" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          )}
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-slate-500 text-xs mb-2">Total This Month</p>
          <p className="text-white font-black text-3xl">${(monthTotal / 100).toFixed(2)}</p>
          <p className="text-slate-600 text-xs mt-1">{monthExp.length} expense{monthExp.length !== 1 ? 's' : ''}</p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs mb-2">Paid by You</p>
          <p className="text-white font-black text-3xl">${(myTotal / 100).toFixed(2)}</p>
          <p className="text-slate-600 text-xs mt-1">this month</p>
        </Card>
        <Card>
          <p className="text-slate-500 text-xs mb-2">Circle Members</p>
          <p className="text-white font-black text-3xl">{members.length || '—'}</p>
          <p className="text-slate-600 text-xs mt-1">splitting costs</p>
        </Card>
      </div>

      {loading && [1,2,3].map(n => <div key={n} className="glass rounded-2xl p-4 h-16 mb-3 animate-pulse" />)}

      {!loading && expenses.length === 0 && (
        <Card padding="p-16" className="text-center">
          <DollarSign className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No expenses yet</p>
          <p className="text-slate-500 text-sm mb-5">Start tracking caregiving costs to split them fairly.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Add the first expense →</button>
        </Card>
      )}

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {expenses.map((expense) => {
            const icon  = EXPENSE_ICONS[expense.category] ?? '📦'
            const isOwn = expense.paid_by === user?.id
            return (
              <motion.div key={expense.id} layout {...fadeSlideUp} className="glass rounded-2xl p-4 flex items-center gap-4 card-hover group">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{expense.label}</p>
                  <p className="text-slate-500 text-xs">{expense.payer?.full_name ?? 'You'} · {fmtDate(expense.expense_date)}</p>
                </div>
                {expense.receipt && (
                  <IconButton onClick={() => viewReceipt(expense.receipt)} aria-label="View receipt" className="flex-shrink-0 hover:text-indigo-400">
                    <FileImage className="w-4 h-4" />
                  </IconButton>
                )}
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold">${(expense.amount_cents / 100).toFixed(2)}</p>
                  {members.length > 1 && <p className="text-slate-600 text-xs">÷{members.length} = ${(expense.amount_cents / 100 / members.length).toFixed(2)}</p>}
                </div>
                {isOwn && (
                  <IconButton onClick={() => deleteExpense(expense.id)} variant="danger" aria-label={`Delete ${expense.label}`} className="opacity-40 group-hover:opacity-100 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {showModal && (
        <AddExpenseModal
          circleId={circleId}
          can={can}
          onClose={() => setShowModal(false)}
          onSave={async (d) => { await addExpense(d); setShowModal(false) }}
        />
      )}
    </div>
  )
}

function AddExpenseModal({ circleId, can, onClose, onSave }) {
  const { user } = useAuth()
  const [label, setLabel]     = useState('')
  const [amount, setAmount]   = useState('')
  const [category, setCategory] = useState('other')
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0])
  const [receiptFile, setReceiptFile] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [receiptError, setReceiptError] = useState(null)

  const canAttachReceipt = !can || can('documents')

  async function handleSave() {
    if (!label.trim() || !amount) return
    setSaving(true)
    setReceiptError(null)

    let receipt_document_id = null
    if (receiptFile) {
      const { document, error } = await uploadDocumentFile({ file: receiptFile, circleId, userId: user.id })
      if (error) {
        setReceiptError(`Couldn't attach receipt: ${error.message}`)
        setSaving(false)
        return
      }
      receipt_document_id = document?.id ?? null
    }

    await onSave({ label: label.trim(), amount, category, expense_date: date, receipt_document_id })
    setSaving(false)
  }

  return (
    <Modal onClose={onClose} title="Add Expense">
      {(requestClose) => (
        <>
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Description</label>
              <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Pharmacy — Metformin" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Amount ($)</label>
                <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-all [color-scheme:dark]" />
              </div>
            </div>
            <div>
              <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {EXPENSE_CATS.map(cat => (
                  <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`py-2.5 rounded-xl text-xs font-medium border transition-all ${category === cat.value ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300' : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  >{cat.label}</button>
                ))}
              </div>
            </div>

            {canAttachReceipt && (
              <div>
                <label className="text-slate-500 text-xs uppercase tracking-widest font-medium block mb-2">Receipt (optional)</label>
                {receiptFile ? (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <FileImage className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm flex-1 truncate">{receiptFile.name}</span>
                    <IconButton onClick={() => setReceiptFile(null)} className="flex-shrink-0 -mr-2 -my-2 hover:text-rose-400" aria-label="Remove receipt">
                      <X className="w-4 h-4" />
                    </IconButton>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-dashed border-white/15 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-pointer transition-colors">
                    <Camera className="w-4 h-4" /> Attach a photo of the receipt
                    <input
                      type="file" className="hidden"
                      accept="image/*,.pdf" capture="environment"
                      onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              </div>
            )}

            {receiptError && (
              <p className="text-rose-400 text-xs bg-rose-500/10 rounded-lg px-3 py-2">{receiptError}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={requestClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={!label.trim() || !amount} loading={saving} className="flex-1">
              {saving ? 'Saving…' : 'Add Expense'}
            </Button>
          </div>
        </>
      )}
    </Modal>
  )
}
