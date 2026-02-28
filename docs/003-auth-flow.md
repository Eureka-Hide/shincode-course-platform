# 003 — 認証フロー実装（ログイン・ログアウト・ルートガード）

**Phase**: 1
**状態**: [完了]
**依存**: 001, 002

## 概要
Supabase Auth を使った Google OAuth ログイン・ログアウト・認証ガードをコードで実装する。

---

## TODO

### Supabase クライアント作成
- [x] `lib/supabase/client.ts` を作成（ブラウザ用）

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

- [x] `lib/supabase/server.ts` を作成（Server Component / Server Actions 用）

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

### Proxy（認証ガード）
- [x] `proxy.ts` をプロジェクトルートに作成（Next.js 16: `middleware.ts` → `proxy.ts` / `proxy()` に改名）
  - 未認証ユーザーを `/login` にリダイレクト
  - 認証済みユーザーが `/login` にアクセスしたら `/` にリダイレクト
  - トークンリフレッシュ処理を含める
  - `matcher` で静的ファイルを除外

### Server Actions（認証）
- [x] `app/actions/auth.ts` を作成
  - `signInWithGoogle()`: Google OAuth でログイン開始
  - `signOut()`: ログアウトして `/login` へリダイレクト

### ルート・ページ実装
- [x] `app/login/page.tsx` を作成
  - 「Google でログイン」ボタンを配置
  - 認証済みの場合は `/` にリダイレクト（Server Component で `getUser()` 確認）
- [x] `app/auth/callback/route.ts` を作成
  - `code` を受け取り `exchangeCodeForSession()` でセッションを確立
  - 完了後 `/` へリダイレクト

### 動作確認
- [x] ローカルで Google ログインが成功する
- [x] ログイン後に `users` テーブルへ自動でレコードが挿入される（Trigger 動作確認）
- [x] ログアウトが機能し `/login` へ遷移する
- [x] 未ログイン状態で `/` にアクセスすると `/login` へリダイレクトされる

---

## 関連ファイル
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `proxy.ts`
- `app/login/page.tsx`
- `app/actions/auth.ts`
- `app/auth/callback/route.ts`

## 完了条件
- Google ログイン → コールバック → ホーム画面の一連のフローが動作する
- ログアウト後に保護ページへアクセスすると `/login` へリダイレクトされる
