'use client'

import YouTube, { YouTubeEvent } from 'react-youtube'
import { useRef } from 'react'

type Props = {
  url: string
  onPlay?: () => void
  onPause?: () => void
  onEnd?: () => void
  onProgress?: (pct: number) => void
}

function extractVideoId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/)
  return match?.[1] ?? ''
}

export default function YouTubePlayer({ url, onPlay, onPause, onEnd, onProgress }: Props) {
  const videoId = extractVideoId(url)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  if (!videoId) return null

  function handlePlay(event: YouTubeEvent) {
    onPlay?.()
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const player = event.target
      const duration = player.getDuration()
      if (duration > 0) {
        const pct = Math.min(99, Math.floor((player.getCurrentTime() / duration) * 100))
        if (pct > 0) onProgress?.(pct)
      }
    }, 1_000)
  }

  function handlePause() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    onPause?.()
  }

  function handleEnd() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    onEnd?.()
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <YouTube
        videoId={videoId}
        className="absolute inset-0 w-full h-full"
        iframeClassName="w-full h-full"
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0,
            rel: 0,
            modestbranding: 1,
          },
        }}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnd={handleEnd}
      />
    </div>
  )
}
