# 003 — 認証フロー実装（ログイン・ログアウト・ルートガード）

**Phase**: 1
**状態**: []
**依存**: 001, 002

## 概要
Supabase Auth を使った Google OAuth ログイン・ログアウト・認証ガードをコードで実装する。

---

## TODO

### Supabase クライアント作成
- [ ] `lib/supabase/client.ts` を作成（ブラウザ用）

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

- [ ] `lib/supabase/server.ts` を作成（Server Component / Server Actions 用）

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

### Middleware（認証ガード）
- [ ] `middleware.ts` をプロジェクトルートに作成
  - 未認証ユーザーを `/login` にリダイレクト
  - 認証済みユーザーが `/login` にアクセスしたら `/` にリダイレクト
  - トークンリフレッシュ処理を含める
  - `matcher` で静的ファイルを除外

### Server Actions（認証）
- [ ] `app/actions/auth.ts` を作成
  - `signInWithGoogle()`: Google OAuth でログイン開始
  - `signOut()`: ログアウトして `/login` へリダイレクト

### ルート・ページ実装
- [ ] `app/login/page.tsx` を作成
  - 「Google でログイン」ボタンを配置
  - 認証済みの場合は `/` にリダイレクト（Server Component で `getUser()` 確認）
- [ ] `app/auth/callback/route.ts` を作成
  - `code` を受け取り `exchangeCodeForSession()` でセッションを確立
  - 完了後 `/` へリダイレクト

### 動作確認
- [ ] ローカルで Google ログインが成功する
- [ ] ログイン後に `users` テーブルへ自動でレコードが挿入される（Trigger 動作確認）
- [ ] ログアウトが機能し `/login` へ遷移する
- [ ] 未ログイン状態で `/` にアクセスすると `/login` へリダイレクトされる

---

## 関連ファイル
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `middleware.ts`
- `app/login/page.tsx`
- `app/actions/auth.ts`
- `app/auth/callback/route.ts`

## 完了条件
- Google ログイン → コールバック → ホーム画面の一連のフローが動作する
- ログアウト後に保護ページへアクセスすると `/login` へリダイレクトされる
