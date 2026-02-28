import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import VideoPlayerSection from '@/app/components/VideoPlayerSection'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: video } = await supabase
    .from('videos')
    .select('title')
    .eq('id', id)
    .single()

  return {
    title: video ? `${video.title} | ShinCode Course` : 'ShinCode Course',
  }
}

const difficultyLabel: Record<string, string> = {
  beginner:     '入門',
  intermediate: '中級',
  advanced:     '上級',
}
const difficultyClass: Record<string, string> = {
  beginner:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  advanced:     'bg-red-500/10    text-red-400    border-red-500/20',
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: video }, { data: { user } }] = await Promise.all([
    supabase.from('videos').select('*').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!video) notFound()

  const { data: progressRecord } = await supabase
    .from('progress')
    .select('progress_percentage')
    .eq('user_id', user!.id)
    .eq('video_id', id)
    .maybeSingle()

  const initialProgress = progressRecord?.progress_percentage ?? 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        コース一覧に戻る
      </Link>

      {/* YouTube プレーヤー + 進捗バー */}
      <VideoPlayerSection url={video.youtube_url} dbVideoId={video.id} initialProgress={initialProgress} />

      {/* 動画情報 */}
      <div className="space-y-4">
        {/* タイトル + メタ情報 */}
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-white leading-snug">
            {video.title}
          </h1>

          <div className="flex items-center gap-2 flex-wrap">
            {video.difficulty_level && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${difficultyClass[video.difficulty_level]}`}>
                {difficultyLabel[video.difficulty_level]}
              </span>
            )}
            {video.duration_minutes && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                </svg>
                {video.duration_minutes} 分
              </span>
            )}
            {video.tags && video.tags.length > 0 && video.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 rounded-md text-xs bg-zinc-800 text-zinc-400 border border-zinc-700">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 区切り線 */}
        {video.description && (
          <div className="border-t border-zinc-800 pt-4">
            <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
