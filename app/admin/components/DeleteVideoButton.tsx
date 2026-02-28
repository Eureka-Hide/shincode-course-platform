'use client'

import { useTransition } from 'react'
import { deleteVideo } from '@/app/actions/videos'

type Props = {
  id: string
  title: string
}

export default function DeleteVideoButton({ id, title }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm(`「${title}」を削除しますか？\nこの操作は元に戻せません。`)) return
    startTransition(() => deleteVideo(id))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 border border-red-900/50 hover:border-red-700 rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending ? '削除中…' : '削除'}
    </button>
  )
}
