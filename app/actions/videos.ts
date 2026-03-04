'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const YOUTUBE_URL_PATTERN = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w\-]{11}/

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) throw new Error('Forbidden')

  return supabase
}

export async function createVideo(formData: FormData) {
  const supabase = await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const youtube_url = formData.get('youtube_url') as string
  const duration_minutes = formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null
  const difficulty_level = (formData.get('difficulty_level') as string) || null
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const order = formData.get('order') ? Number(formData.get('order')) : 0

  if (!title?.trim()) throw new Error('タイトルは必須です')
  if (!YOUTUBE_URL_PATTERN.test(youtube_url)) throw new Error('YouTube URL の形式が正しくありません')

  let thumbnail_url: string | null = null
  const thumbnailFile = formData.get('thumbnail') as File
  if (thumbnailFile?.size > 0) {
    thumbnail_url = await uploadThumbnail(thumbnailFile)
  }

  await supabase.from('videos').insert({
    title,
    description: description || null,
    youtube_url,
    thumbnail_url,
    duration_minutes,
    difficulty_level,
    tags,
    order,
  })

  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function updateVideo(id: string, formData: FormData) {
  const supabase = await requireAdmin()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const youtube_url = formData.get('youtube_url') as string
  const duration_minutes = formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : null
  const difficulty_level = (formData.get('difficulty_level') as string) || null
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : []
  const order = formData.get('order') ? Number(formData.get('order')) : 0

  if (!title?.trim()) throw new Error('タイトルは必須です')
  if (!YOUTUBE_URL_PATTERN.test(youtube_url)) throw new Error('YouTube URL の形式が正しくありません')

  const updateData: Record<string, unknown> = {
    title,
    description: description || null,
    youtube_url,
    duration_minutes,
    difficulty_level,
    tags,
    order,
    updated_at: new Date().toISOString(),
  }

  const thumbnailFile = formData.get('thumbnail') as File
  if (thumbnailFile?.size > 0) {
    const url = await uploadThumbnail(thumbnailFile)
    if (url) updateData.thumbnail_url = url
  }

  await supabase.from('videos').update(updateData).eq('id', id)

  revalidatePath('/')
  revalidatePath('/admin')
  redirect('/admin')
}

export async function deleteVideo(id: string) {
  const supabase = await requireAdmin()

  // サムネイルパスを取得
  const { data: video } = await supabase
    .from('videos')
    .select('thumbnail_url')
    .eq('id', id)
    .single()

  // DBレコード削除
  await supabase.from('videos').delete().eq('id', id)

  // Storageからサムネイル削除
  if (video?.thumbnail_url) {
    const pathParts = video.thumbnail_url.split('/thumbnails/')
    if (pathParts.length > 1) {
      await supabase.storage.from('thumbnails').remove([pathParts[1]])
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')
}

async function uploadThumbnail(file: File): Promise<string | null> {
  // ファイルサイズチェック
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`ファイルサイズは ${MAX_FILE_SIZE / 1024 / 1024}MB 以下にしてください`)
  }

  // MIMEタイプチェック
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('JPEG・PNG・WebP・GIF のみアップロードできます')
  }

  const supabase = await createClient()
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('thumbnails')
    .upload(filename, file, {
      upsert: false,
      contentType: file.type,
    })

  if (error) return null

  const { data } = supabase.storage.from('thumbnails').getPublicUrl(filename)
  return data.publicUrl
}
