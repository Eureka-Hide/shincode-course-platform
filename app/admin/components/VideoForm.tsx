'use client'

import { useRef, useState } from 'react'
import { createVideo, updateVideo } from '@/app/actions/videos'

type Video = {
  id: string
  title: string
  description: string | null
  youtube_url: string
  thumbnail_url: string | null
  duration_minutes: number | null
  difficulty_level: string | null
  tags: string[] | null
  order: number | null
}

type Props = {
  video?: Video
}

const inputClass =
  'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors'

export default function VideoForm({ video }: Props) {
  const [preview, setPreview] = useState<string | null>(video?.thumbnail_url ?? null)
  const fileRef = useRef<HTMLInputElement>(null)

  const action = video ? updateVideo.bind(null, video.id) : createVideo

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  return (
    <form action={action} className="space-y-6 max-w-2xl">

      {/* タイトル */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          defaultValue={video?.title ?? ''}
          required
          className={inputClass}
          placeholder="動画タイトルを入力"
        />
      </div>

      {/* YouTube URL */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300">
          YouTube URL <span className="text-red-400">*</span>
        </label>
        <input
          name="youtube_url"
          defaultValue={video?.youtube_url ?? ''}
          required
          className={inputClass}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>

      {/* 説明 */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-300">説明</label>
        <textarea
          name="description"
          defaultValue={video?.description ?? ''}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="動画の説明を入力"
        />
      </div>

      {/* サムネイル */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">サムネイル</label>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="サムネイルプレビュー"
            className="w-48 aspect-video object-cover rounded-lg bg-zinc-800"
          />
        )}
        <input
          ref={fileRef}
          name="thumbnail"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block text-sm text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer file:transition-colors"
        />
      </div>

      {/* 難易度 + 時間 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">難易度</label>
          <select
            name="difficulty_level"
            defaultValue={video?.difficulty_level ?? ''}
            className={inputClass}
          >
            <option value="">選択なし</option>
            <option value="beginner">入門</option>
            <option value="intermediate">中級</option>
            <option value="advanced">上級</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">視聴時間（分）</label>
          <input
            name="duration_minutes"
            type="number"
            min="1"
            defaultValue={video?.duration_minutes ?? ''}
            className={inputClass}
            placeholder="例: 15"
          />
        </div>
      </div>

      {/* タグ + 表示順 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">タグ</label>
          <input
            name="tags"
            defaultValue={video?.tags?.join(', ') ?? ''}
            className={inputClass}
            placeholder="ChatGPT, Next.js"
          />
          <p className="text-xs text-zinc-600">カンマ区切りで入力</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-300">表示順</label>
          <input
            name="order"
            type="number"
            min="0"
            defaultValue={video?.order ?? ''}
            className={inputClass}
            placeholder="例: 1"
          />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {video ? '更新する' : '追加する'}
        </button>
        <a
          href="/admin"
          className="px-5 py-2.5 text-sm font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
        >
          キャンセル
        </a>
      </div>

    </form>
  )
}
