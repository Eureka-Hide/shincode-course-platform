import VideoForm from '@/app/admin/components/VideoForm'

export const metadata = {
  title: '動画追加 | ShinCode Course',
}

export default function NewVideoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">新規動画を追加</h1>
        <p className="text-sm text-zinc-500 mt-1">動画情報を入力してください</p>
      </div>
      <VideoForm />
    </div>
  )
}
