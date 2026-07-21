import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from './useSubscription'
import { getDocumentSignedUrl, uploadDocumentFile } from '../lib/documentStorage'

const QUOTA_BYTES = {
  family: 500 * 1024 * 1024,       // 500MB
  pro:    5 * 1024 * 1024 * 1024,  // 5GB
}

export function useDocuments(circleId) {
  const { user }            = useAuth()
  const { tier }            = useSubscription()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)

  const usedBytes  = documents.reduce((sum, d) => sum + (d.file_size ?? 0), 0)
  const quotaBytes = QUOTA_BYTES[tier] ?? QUOTA_BYTES.family

  useEffect(() => {
    if (!circleId) { setLoading(false); return }
    fetchDocs()

    const channel = supabase
      .channel(`documents:${circleId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'documents',
        filter: `circle_id=eq.${circleId}`,
      }, fetchDocs)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [circleId])

  async function fetchDocs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('documents')
      .select('*, profiles:uploaded_by(full_name)')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
    if (!error) setDocuments(data ?? [])
    setLoading(false)
  }

  async function uploadDocument(file) {
    if (!file || !circleId || !user) return { error: new Error('Missing required fields') }
    if (usedBytes + file.size > quotaBytes) {
      const quotaLabel = quotaBytes >= 1024 ** 3 ? `${(quotaBytes / 1024 ** 3).toFixed(0)}GB` : `${(quotaBytes / 1024 ** 2).toFixed(0)}MB`
      return { error: new Error(`This would exceed your ${quotaLabel} document vault limit. Delete an old document or upgrade for more space.`) }
    }
    setUploading(true)
    try {
      const { document: inserted, error } = await uploadDocumentFile({ file, circleId, userId: user.id })
      if (error) throw error

      await fetchDocs()

      // Fire-and-forget AI summarization (non-blocking — updates ai_summary when done)
      if (inserted?.id) {
        supabase.functions.invoke('summarize-document', { body: { documentId: inserted.id } })
          .then(() => fetchDocs())
          .catch(() => {})
      }

      return { document: inserted, error: null }
    } catch (err) {
      return { error: err }
    } finally {
      setUploading(false)
    }
  }

  async function deleteDocument(doc) {
    await supabase.storage.from('documents').remove([doc.file_path])
    const { error } = await supabase.from('documents').delete().eq('id', doc.id)
    if (!error) setDocuments(prev => prev.filter(d => d.id !== doc.id))
    return { error }
  }

  return { documents, loading, uploading, uploadDocument, deleteDocument, getSignedUrl: getDocumentSignedUrl, usedBytes, quotaBytes }
}
