'use client'

import Link from 'next/link'

export default function VideoError() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center">
        <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-400">動画の読み込みに失敗しました</p>
        <p className="text-xs text-zinc-600 mt-1">しばらく経ってから再度お試しください</p>
      </div>
      <Link
        href="/"
        className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
      >
        コース一覧に戻る
      </Link>
    </div>
  )
}
