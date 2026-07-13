import { supabase } from './supabase'

/**
 * Pure storage helpers shared by useDocuments and any component that
 * needs to view/upload a single file without paying for the full
 * hook's list-fetch + realtime subscription (e.g. a receipt viewer
 * on an expense row).
 */
export async function getDocumentSignedUrl(filePath) {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600)
  return { url: data?.signedUrl ?? null, error }
}

export async function uploadDocumentFile({ file, circleId, userId }) {
  const docId    = crypto.randomUUID()
  const filePath = `${circleId}/${docId}/${file.name}`

  const { error: upErr } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { contentType: file.type, upsert: false })
  if (upErr) return { error: upErr }

  const { data: inserted, error: dbErr } = await supabase.from('documents').insert({
    circle_id:   circleId,
    uploaded_by: userId,
    name:        file.name,
    file_path:   filePath,
    file_size:   file.size,
    mime_type:   file.type,
  }).select('id').single()

  if (dbErr) {
    await supabase.storage.from('documents').remove([filePath])
    return { error: dbErr }
  }

  return { document: inserted, error: null }
}
