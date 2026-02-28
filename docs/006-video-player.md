# 006 — YouTube 埋め込み再生画面

**Phase**: 2
**状態**: [完了]
**依存**: 005

## 概要
`/videos/[id]` で YouTube 動画を埋め込み再生できる画面を実装する。
タイトル・説明の表示と、一覧ページへ戻るナビゲーションを含める。

---

## TODO

### ライブラリインストール
- [x] `react-youtube` をインストール

```bash
npm install react-youtube
```

### ページ実装
- [x] `app/(auth)/videos/[id]/page.tsx` を作成（Server Component）
  - Supabase から動画データを `id` で取得
  - 存在しない `id` の場合は `notFound()` を返す
  - `generateMetadata` で動画タイトルをページタイトルに設定

### YouTube プレーヤーコンポーネント
- [x] `app/components/YouTubePlayer.tsx` を作成（`'use client'`）
  - `react-youtube` の `<YouTube>` コンポーネントを使用
  - `youtube_url` から動画 ID を抽出するユーティリティ関数を実装
  - レスポンシブ対応（コンテナ幅に合わせてリサイズ）

```typescript
// YouTube URL から動画 ID を抽出
function extractVideoId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)
  return match?.[1] ?? ''
}
```

### ページレイアウト
- [x] 動画プレーヤー（上部・全幅）
- [x] タイトル・説明（プレーヤー下部）
- [x] 難易度・視聴時間・タグの表示
- [x] 「← コース一覧に戻る」リンク（`next/link`）

### エラー・ローディング
- [x] `app/(auth)/videos/[id]/loading.tsx` を作成（スケルトン UI）
- [x] `app/(auth)/videos/[id]/error.tsx` を作成

---

## 関連ファイル
- `app/videos/[id]/page.tsx`
- `app/videos/[id]/loading.tsx`
- `app/videos/[id]/error.tsx`
- `app/components/YouTubePlayer.tsx`

## 完了条件
- 動画詳細ページで YouTube プレーヤーが表示・再生できる
- タイトルと説明が表示される
- 一覧ページに戻るリンクが機能する
- 存在しない ID へのアクセスで 404 ページが表示される
