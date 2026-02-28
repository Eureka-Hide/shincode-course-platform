import Image from 'next/image'
import Link from 'next/link'

type Props = {
  video: {
    id: string
    title: string
    description: string | null
    thumbnail_url: string | null
    duration_minutes: number | null
    difficulty_level: string | null
  }
  progressPercentage: number
}

const difficultyConfig: Record<string, { label: string; className: string }> = {
  beginner:     { label: '入門', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  intermediate: { label: '中級', className: 'bg-amber-500/10  text-amber-400  border-amber-500/20'  },
  advanced:     { label: '上級', className: 'bg-red-500/10    text-red-400    border-red-500/20'    },
}

export default function VideoCard({ video, progressPercentage }: Props) {
  const difficulty = video.difficulty_level ? difficultyConfig[video.difficulty_level] : null

  const progressStatus =
    progressPercentage === 0   ? 'unstarted' :
    progressPercentage === 100 ? 'completed'  : 'watching'

  const thumbnailSrc = video.thumbnail_url

  return (
    <Link
      href={`/videos/${video.id}`}
      className="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5"
    >
      {/* サムネイル */}
      <div className="aspect-video relative bg-zinc-800">
        {thumbnailSrc ? (
          <Image
            src={thumbnailSrc}
            alt={video.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 to-blue-900/20 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-zinc-700/80 flex items-center justify-center group-hover:bg-violet-600/60 transition-colors duration-200">
              <svg className="w-5 h-5 text-zinc-300 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* 完了バッジ */}
        {progressStatus === 'completed' && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>

      {/* 進捗バー */}
      <div className="h-0.5 bg-zinc-800">
        {progressStatus === 'watching' && (
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${progressPercentage}%` }} />
        )}
        {progressStatus === 'completed' && (
          <div className="h-full bg-emerald-500 w-full" />
        )}
      </div>

      {/* テキスト */}
      <div className="p-4 space-y-2.5">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-violet-300 transition-colors">
          {video.title}
        </h3>

        {video.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        )}

        {/* メタ情報 */}
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          {difficulty && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${difficulty.className}`}>
              {difficulty.label}
            </span>
          )}
          {video.duration_minutes && (
            <span className="text-[11px] text-zinc-600 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
              {video.duration_minutes} 分
            </span>
          )}
          {progressStatus === 'watching' && (
            <span className="ml-auto text-[11px] text-blue-400 font-medium">
              {progressPercentage}% 視聴済み
            </span>
          )}
          {progressStatus === 'completed' && (
            <span className="ml-auto text-[11px] text-emerald-400 font-medium">完了</span>
          )}
          {progressStatus === 'unstarted' && (
            <span className="ml-auto text-[11px] text-zinc-600">未視聴</span>
          )}
        </div>
      </div>
    </Link>
  )
}
