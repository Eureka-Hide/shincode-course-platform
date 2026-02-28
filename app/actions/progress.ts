'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertProgress(videoId: string, percentage: number) {
  if (!videoId) return
  const clampedPercentage = Math.min(100, Math.max(0, Math.floor(percentage)))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('progress').upsert({
    user_id: user.id,
    video_id: videoId,
    progress_percentage: clampedPercentage,
    last_watched_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,video_id' })

  revalidatePath('/')
}
