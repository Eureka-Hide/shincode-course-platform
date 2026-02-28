'use client'

import { useState, useRef } from 'react'
import YouTubePlayer from './YouTubePlayer'
import { upsertProgress } from '@/app/actions/progress'

type Props = {
  url: string
  dbVideoId: string
  initialProgress: number
}

export default function VideoPlayerSection({ url, dbVideoId, initialProgress }: Props) {
  const [progress, setProgress] = useState(initialProgress)
  const tickRef = useRef(0)
  const hasStartedRef = useRef(initialProgress > 0)

  function handlePlay() {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      setProgress(1)
      upsertProgress(dbVideoId, 1)
    }
  }

  function handleProgress(pct: number) {
    setProgress(pct)
    tickRef.current += 1
    if (tickRef.current % 30 === 0) {
      upsertProgress(dbVideoId, pct)
    }
  }

  function handleEnd() {
    setProgress(100)
    upsertProgress(dbVideoId, 100)
  }

  const status =
    progress === 0   ? 'unstarted' :
    progress === 100 ? 'completed'  : 'watching'

  return (
    <div className="space-y-3">
      <YouTubePlayer
        url={url}
        onPlay={handlePlay}
        onProgress={handleProgress}
        onEnd={handleEnd}
      />

      {/* 進捗バー */}
      <div className="space-y-2 px-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">視聴進捗</span>
          {status === 'unstarted' && (
            <span className="text-xs text-zinc-600">未視聴</span>
          )}
          {status === 'watching' && (
            <span className="text-xs text-blue-400 font-medium tabular-nums">
              {progress}%
            </span>
          )}
          {status === 'completed' && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              視聴完了
            </span>
          )}
        </div>

        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          {status === 'watching' && (
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          )}
          {status === 'completed' && (
            <div className="h-full bg-emerald-500 rounded-full w-full" />
          )}
        </div>
      </div>
    </div>
  )
}
