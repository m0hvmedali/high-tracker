import { supabase } from './supabaseClient'
import type { MediaKind } from '@/types'

export async function uploadMedia(lessonId: string, kind: MediaKind, file: File) {
  const path = `media/${lessonId}/${kind}/${crypto.randomUUID()}-${file.name}`
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

export async function getSignedUrl(path: string, expiresIn = 60 * 60) {
  const { data, error } = await supabase.storage.from('media').createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}
