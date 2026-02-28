import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DeleteVideoButton from './components/DeleteVideoButton'

export const metadata = {
  title: '管理画面 | ShinCode Course',
}

const difficultyLabel: Record<string, string> = {
  beginner: '入門',
  intermediate: '中級',
  advanced: '上級',
}

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: videos } = await supabase
    .from('videos')
    .select('id, title, difficulty_level, duration_minutes, order')
    .order('order', { ascending: true })

  return (
    <div className="space-y-6">

      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">管理画面</h1>
          <p className="text-sm text-zinc-500 mt-1">{videos?.length ?? 0} 本の動画</p>
        </div>
        <Link
          href="/admin/videos/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          新規動画を追加
        </Link>
      </div>

      {/* テーブル */}
      {!videos || videos.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 rounded-xl text-zinc-600 text-sm">
          動画がまだありません
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 w-16">順番</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">タイトル</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 hidden md:table-cell w-24">難易度</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 hidden md:table-cell w-24">時間</th>
                <th className="px-5 py-3 w-36"></th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video, i) => (
                <tr
                  key={video.id}
                  className={`hover:bg-zinc-800/30 transition-colors ${i < videos.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
                >
                  <td className="px-5 py-4 text-zinc-600 tabular-nums text-center">
                    {video.order ?? '—'}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/videos/${video.id}`}
                      className="text-white hover:text-violet-400 transition-colors font-medium line-clamp-1"
                    >
                      {video.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {video.difficulty_level ? (
                      <span className="text-xs text-zinc-400">
                        {difficultyLabel[video.difficulty_level] ?? video.difficulty_level}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-xs text-zinc-500">
                    {video.duration_minutes ? `${video.duration_minutes} 分` : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/videos/${video.id}/edit`}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
                      >
                        編集
                      </Link>
                      <DeleteVideoButton id={video.id} title={video.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
