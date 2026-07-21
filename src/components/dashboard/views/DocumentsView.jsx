import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Upload, Trash2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { useDocuments } from '../../../hooks/useDocuments'
import { fadeSlideUp } from '../../../lib/motion'
import Button from '../../ui/Button'
import IconButton from '../../ui/IconButton'
import IconBadge from '../../ui/IconBadge'
import Card from '../../ui/Card'

// ── DocumentsView ─────────────────────────────────────────────────────────────

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export default function DocumentsView({ circleId }) {
  const { user }  = useAuth()
  const { documents, loading, uploading, uploadDocument, deleteDocument, getSignedUrl, usedBytes, quotaBytes } = useDocuments(circleId)
  const [dragOver, setDragOver] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)

  async function handleFiles(files) {
    setUploadError(null)
    for (const file of files) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setUploadError(`${file.name} is larger than 10 MB — please upload a smaller file.`)
        continue
      }
      const { error } = await uploadDocument(file)
      if (error) setUploadError(`Couldn't upload ${file.name}: ${error.message}`)
    }
  }

  async function handleView(doc) {
    const { url, error } = await getSignedUrl(doc.file_path)
    if (url) window.open(url, '_blank', 'noopener')
    else console.error('Signed URL error:', error)
  }

  function fmtSize(bytes) {
    if (!bytes) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  }

  function docIcon(mimeType, name) {
    const ext = name?.split('.').pop()?.toLowerCase()
    if (mimeType?.startsWith('image/') || ['jpg','jpeg','png','gif','webp'].includes(ext)) return '🖼️'
    if (mimeType === 'application/pdf' || ext === 'pdf') return '📋'
    if (['doc','docx'].includes(ext)) return '📝'
    return '📄'
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Document Vault</h2>
          <p className="text-slate-500 text-sm">Securely store and share important documents</p>
        </div>
        <input
          ref={fileInputRef}
          type="file" className="hidden" multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx"
          onChange={e => handleFiles(Array.from(e.target.files ?? []))}
          disabled={uploading}
        />
        <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
          {uploading ? 'Uploading…' : <><Upload className="w-4 h-4" /> Upload</>}
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${usedBytes / quotaBytes > 0.9 ? 'bg-rose-500' : 'bg-indigo-500'}`}
            style={{ width: `${Math.min(100, (usedBytes / quotaBytes) * 100)}%` }}
          />
        </div>
        <span className="text-slate-500 text-xs flex-shrink-0">{fmtSize(usedBytes)} of {fmtSize(quotaBytes)} used</span>
      </div>

      <div
        className={`glass rounded-2xl border-2 border-dashed transition-colors p-10 text-center mb-6 ${dragOver ? 'border-indigo-500/70 bg-indigo-500/5' : 'border-white/10 hover:border-indigo-500/40'}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(Array.from(e.dataTransfer.files)) }}
      >
        <div className={`mx-auto mb-4 transition-transform ${dragOver ? 'scale-125' : ''}`}>
          <IconBadge icon={Upload} tone="indigo" size="lg" className="mx-auto" />
        </div>
        <p className="text-white font-semibold mb-1">{dragOver ? 'Drop to upload' : 'Drop files here to upload'}</p>
        <p className="text-slate-500 text-sm">PDF, JPG, PNG, DOCX up to 10 MB</p>
      </div>

      {uploadError && (
        <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 mb-6">{uploadError}</p>
      )}

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(n => <div key={n} className="glass rounded-2xl h-32 animate-pulse" />)}
        </div>
      )}

      {!loading && documents.length === 0 && (
        <Card padding="p-16" className="text-center">
          <FolderOpen className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">No documents yet</p>
          <p className="text-slate-500 text-sm mb-5">Upload living wills, insurance cards, and medication lists.</p>
          <button onClick={() => fileInputRef.current?.click()} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Upload the first document →</button>
        </Card>
      )}

      {documents.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence initial={false}>
            {documents.map((doc) => (
              <motion.div key={doc.id} layout {...fadeSlideUp} className="glass rounded-2xl p-5 card-hover relative group">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{docIcon(doc.mime_type, doc.name)}</div>
                  {doc.uploaded_by === user?.id && (
                    <IconButton
                      onClick={() => deleteDocument(doc)}
                      variant="danger"
                      aria-label={`Delete ${doc.name}`}
                      className="opacity-40 group-hover:opacity-100 -mt-2 -mr-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  )}
                </div>
                <button onClick={() => handleView(doc)} className="block w-full text-left">
                  <p className="text-white font-semibold text-sm mb-1 truncate" title={doc.name}>{doc.name}</p>
                  <p className="text-slate-400 text-xs">{fmtSize(doc.file_size)} · {doc.profiles?.full_name ?? 'You'}</p>
                  {doc.ai_summary && (
                    <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-2">{doc.ai_summary}</p>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
