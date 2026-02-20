# 007 — 視聴進捗記録機能

**Phase**: 3
**状態**: []
**依存**: 006

## 概要
YouTube IFrame Player API のイベントを利用して視聴進捗を自動記録する。
進捗は `progress` テーブルに保存し、動画一覧の進捗バーに反映する。

---

## TODO

### Server Action 作成
- [ ] `app/actions/progress.ts` を作成

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertProgress(videoId: string, percentage: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('progress').upsert({
    user_id: user.id,
    video_id: videoId,
    progress_percentage: percentage,
    last_watched_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,video_id' })

  revalidatePath('/')
}
```

### YouTubePlayer コンポーネント拡張
- [ ] `app/components/YouTubePlayer.tsx` に進捗記録ロジックを追加
  - `onPlay` イベント: 進捗が 0 なら 1（視聴中）として記録
  - `onEnd` イベント: 100（完了）として記録
  - 一定間隔（例: 30 秒）で現在の再生位置から進捗率を計算して記録
    - `player.getCurrentTime()` / `player.getDuration()` で算出

### 進捗取得の最適化
- [ ] 動画一覧ページで `progress` を JOIN して取得する SQL を最適化
- [ ] 動画詳細ページでも現在の進捗を表示（「前回 XX% まで視聴済み」）

### 動作確認
- [ ] 動画を再生すると `progress` テーブルに「視聴中」レコードが作成される
- [ ] 動画を最後まで見ると `progress_percentage` が 100 になる
- [ ] 動画一覧に戻ると進捗バーが更新されている

---

## 関連ファイル
- `app/actions/progress.ts`
- `app/components/YouTubePlayer.tsx`
- `app/page.tsx`（進捗 JOIN クエリ）

## 完了条件
- 動画再生開始で進捗が「視聴中」に更新される
- 動画完了で進捗が「完了（100%）」に更新される
- 動画一覧の進捗バーがリアルタイムで反映される
