import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSubscription } from './useSubscription'

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
      const docId    = crypto.randomUUID()
      const filePath = `${circleId}/${docId}/${file.name}`

      const { error: upErr } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { contentType: file.type, upsert: false })
      if (upErr) throw upErr

      const { data: inserted, error: dbErr } = await supabase.from('documents').insert({
        circle_id:   circleId,
        uploaded_by: user.id,
        name:        file.name,
        file_path:   filePath,
        file_size:   file.size,
        mime_type:   file.type,
      }).select('id').single()
      if (dbErr) {
        await supabase.storage.from('documents').remove([filePath])
        throw dbErr
      }

      await fetchDocs()

      // Fire-and-forget AI summarization (non-blocking — updates ai_summary when done)
      if (inserted?.id) {
        supabase.functions.invoke('summarize-document', { body: { documentId: inserted.id } })
          .then(() => fetchDocs())
          .catch(() => {})
      }

      return { error: null }
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

  async function getSignedUrl(filePath) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 3600)
    return { url: data?.signedUrl ?? null, error }
  }

  return { documents, loading, uploading, uploadDocument, deleteDocument, getSignedUrl, usedBytes, quotaBytes }
}
