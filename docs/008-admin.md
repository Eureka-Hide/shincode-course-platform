# 008 — 管理画面（動画 CRUD・サムネイルアップロード）

**Phase**: 3
**状態**: []
**依存**: 004, 007

## 概要
管理者のみがアクセスできる管理画面を実装する。
動画の追加・編集・削除と、Supabase Storage へのサムネイル画像アップロードを含める。

---

## TODO

### 管理者レイアウト（アクセス制御）
- [ ] `app/admin/layout.tsx` を作成（Server Component）
  - `getUser()` でログインユーザーを取得
  - `users` テーブルから `is_admin` を確認
  - 非管理者は `/` にリダイレクト

### Server Actions（動画 CRUD）
- [ ] `app/actions/videos.ts` を作成

```typescript
'use server'
// createVideo(formData): 動画を追加
// updateVideo(id, formData): 動画を更新
// deleteVideo(id): 動画を削除
// uploadThumbnail(file): Supabase Storage にアップロードし URL を返す
```

- [ ] `createVideo`: タイトル・説明・YouTube URL・サムネイル・表示順を登録
- [ ] `updateVideo`: 各フィールドを更新
- [ ] `deleteVideo`: 動画を削除（関連する `progress` は CASCADE で自動削除）
- [ ] `uploadThumbnail`: 画像ファイルを `thumbnails` バケットにアップロード

### 管理画面トップ（動画一覧）
- [ ] `app/admin/page.tsx` を作成
  - 全動画を `order` 順に一覧表示（テーブル形式）
  - 各行に「編集」「削除」ボタン
  - 「新規動画を追加」ボタン（`/admin/videos/new` へリンク）
  - 削除ボタンは確認ダイアログ付き

### 動画追加フォーム
- [ ] `app/admin/videos/new/page.tsx` を作成
  - タイトル（必須）
  - 説明（テキストエリア）
  - YouTube URL（必須）
  - サムネイル画像アップロード（ファイル選択 → Storage へアップロード）
  - 難易度選択（beginner / intermediate / advanced）
  - 視聴時間（分）
  - タグ入力
  - 表示順（数値）
  - 「保存」「キャンセル」ボタン

### 動画編集フォーム
- [ ] `app/admin/videos/[id]/edit/page.tsx` を作成
  - 既存データを初期値として表示
  - 追加フォームと同じフィールド構成
  - 「更新」「キャンセル」ボタン

### サムネイルプレビュー
- [ ] アップロード前にブラウザでプレビュー表示（`URL.createObjectURL`）
- [ ] 既存サムネイルがある場合は現在の画像を表示

### バリデーション
- [ ] タイトル・YouTube URL は必須チェック
- [ ] YouTube URL の形式バリデーション

---

## 関連ファイル
- `app/admin/layout.tsx`
- `app/admin/page.tsx`
- `app/admin/videos/new/page.tsx`
- `app/admin/videos/[id]/edit/page.tsx`
- `app/actions/videos.ts`

## 完了条件
- 管理者のみ `/admin` にアクセスできる
- 動画の追加・編集・削除が管理画面から操作できる
- サムネイル画像が Supabase Storage にアップロードされ、動画一覧に表示される
- 非管理者が `/admin` にアクセスすると `/` へリダイレクトされる
