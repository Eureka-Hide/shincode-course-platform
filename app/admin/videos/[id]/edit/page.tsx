import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VideoForm from '@/app/admin/components/VideoForm'

type Props = {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: '動画編集 | ShinCode Course',
}

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: video } = await supabase
    .from('videos')
    .select('id, title, description, youtube_url, thumbnail_url, duration_minutes, difficulty_level, tags, order')
    .eq('id', id)
    .single()

  if (!video) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">動画を編集</h1>
        <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{video.title}</p>
      </div>
      <VideoForm video={video} />
    </div>
  )
}
