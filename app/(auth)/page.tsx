import { createClient } from '@/lib/supabase/server'
import VideoCard from '@/app/components/VideoCard'

export const metadata = {
  title: 'ShinCode Course',
}

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 動画一覧を order 昇順で取得
  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, description, thumbnail_url, duration_minutes, difficulty_level')
    .order('order', { ascending: true })

  // ログインユーザーの進捗を取得
  const { data: progressList } = await supabase
    .from('progress')
    .select('video_id, progress_percentage')
    .eq('user_id', user!.id)

  // video_id → progress_percentage のマップ
  const progressMap = Object.fromEntries(
    (progressList ?? []).map(p => [p.video_id, p.progress_percentage])
  )

  return (
    <div className="space-y-8">

      {/* ページヘッダー */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">コース一覧</h1>
        <p className="text-sm text-zinc-500">
          {videos?.length ?? 0} 本の動画
        </p>
      </div>

      {/* 動画一覧 or 空状態 */}
      {!videos || videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 border border-zinc-800 rounded-2xl bg-zinc-900/40">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
            <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V6.375A2.625 2.625 0 014.875 3.75h14.25A2.625 2.625 0 0121.75 6.375v12m-18.375.125A1.125 1.125 0 013.375 19.5m0 0h-.375m18.75 0h.375m0 0A1.125 1.125 0 0121.75 18.375M21.75 19.5V6.375" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-400">動画がまだありません</p>
            <p className="text-xs text-zinc-600 mt-1">管理画面から動画を追加してください</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              progressPercentage={progressMap[video.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
