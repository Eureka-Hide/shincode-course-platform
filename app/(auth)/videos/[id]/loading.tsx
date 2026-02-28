export default function VideoLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      {/* 戻るリンク */}
      <div className="h-4 w-32 bg-zinc-800 rounded-full" />

      {/* プレーヤースケルトン */}
      <div className="aspect-video rounded-xl bg-zinc-800" />

      {/* タイトル */}
      <div className="space-y-3">
        <div className="h-6 bg-zinc-800 rounded-full w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 w-12 bg-zinc-800 rounded-md" />
          <div className="h-5 w-16 bg-zinc-800 rounded-md" />
        </div>
      </div>

      {/* 説明 */}
      <div className="border-t border-zinc-800 pt-4 space-y-2">
        <div className="h-3 bg-zinc-800 rounded-full w-full" />
        <div className="h-3 bg-zinc-800 rounded-full w-5/6" />
        <div className="h-3 bg-zinc-800 rounded-full w-4/6" />
      </div>
    </div>
  )
}
