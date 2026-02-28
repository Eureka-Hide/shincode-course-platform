# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 作業ルール（必須）

### チケット・TODO の更新
タスクを実装・完了したら、**必ず以下を更新すること**：

1. **該当チケットファイル** (`docs/00X-*.md`) の完了項目を `[ ]` → `[x]` に変更
2. **チケットの状態** (`**状態**: []`) を実態に合わせて更新（例: `[完了]`, `[進行中]`, `[動作確認待ち]`）
3. **`docs/000-index.md`** の該当チケットのステータスを更新

> タスク完了後にチケット更新を忘れないこと。実装と同じタイミングで必ず行う。

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000 (uses Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

This is a **Next.js 16 App Router** project named `shincode-course-platform`, bootstrapped with `create-next-app`. It is currently at the initial scaffold stage.

- **Framework**: Next.js 16 with App Router (`app/` directory), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (configured via `@import "tailwindcss"` in `globals.css`, not a config file) with CSS custom properties for theming; dark mode via `prefers-color-scheme`
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`
- **Path alias**: `@/*` maps to the project root (`./`)
- **Linting**: ESLint 9 flat config (`eslint.config.mjs`) using `eslint-config-next` core-web-vitals + TypeScript rules

## Key Files

- `app/layout.tsx` — Root layout; sets fonts, metadata, and wraps all pages
- `app/page.tsx` — Home page (currently the default scaffold page)
- `app/globals.css` — Global styles and Tailwind entry point; defines `--background`/`--foreground` CSS variables
- `next.config.ts` — Next.js config (empty defaults)

---

## Supabase Auth Setup (Next.js App Router)

### インストール
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 環境変数 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```
> 新形式のキー（`sb_publishable_xxx`）を使う。旧形式の場合は `NEXT_PUBLIC_SUPABASE_ANON_KEY`。

### Supabaseクライアント

**`lib/supabase/client.ts`** — ブラウザ（Client Component）用
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

**`lib/supabase/server.ts`** — Server Component / Server Actions / Route Handlers用
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

### `proxy.ts`（プロジェクトルート）
Next.js 16 では `middleware.ts` が廃止され `proxy.ts` / `proxy` 関数に変更された。
Server Componentはクッキーを書き込めないため、proxyでトークンリフレッシュを行う。

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // セッション取得（トークンリフレッシュのためだけに呼ぶ）
  const { data: { user } } = await supabase.auth.getUser()

  // 未認証ユーザーを /login にリダイレクト
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 重要: `getUser()` vs `getSession()`
- **Server側では必ず `supabase.auth.getUser()` を使う**。`getSession()` はJWTを再検証しないため、サーバーコードでの使用は非推奨。
- Client Componentでのセッション表示には `getSession()` または `onAuthStateChange()` を使って良い。

### Google OAuth ログイン実装例

**`app/login/page.tsx`**（Server Component）
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (/* Googleログインボタン */)
}
```

**`app/actions/auth.ts`**（Server Actions）
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signInWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })
  if (data.url) redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

**`app/auth/callback/route.ts`**（OAuthコールバック）
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(`${origin}/`)
}
```

---

## Next.js App Router Best Practices

### Server vs Client Components
- **デフォルトはServer Component**。`'use client'` は必要な場合のみ付与する。
- `'use client'` が必要なケース: `useState` / `useEffect` などのフック使用、ブラウザAPIアクセス、イベントハンドラ、YouTube IFrame APIなど外部クライアントライブラリ。
- データフェッチはServer Componentで行い、結果をClient Componentにpropsで渡す。
- Client Componentはツリーの末端（葉）に配置し、Server Componentの範囲を最大化する。

### Data Fetching
- Server ComponentではSupabaseのサーバークライアントを使って直接fetchする（`async/await`）。
- `fetch` を使う場合は Next.js の `cache` / `revalidate` オプションを明示的に指定する。
- Client Componentからのデータ取得は Server Actions または Route Handlers 経由で行う。

### Server Actions
- フォーム送信・データ変更には Server Actions (`'use server'`) を使う。
- `app/actions/` ディレクトリにまとめて配置する。
- 変更後は `revalidatePath` / `revalidateTag` でキャッシュを無効化する。

### Routing & Layout
- 共通UIは `layout.tsx` に配置してネストを活用する。
- ローディング状態は `loading.tsx`、エラー状態は `error.tsx` をセグメントごとに作成する。
- 認証ガードは `proxy.ts`（プロジェクトルート）で実装し、`matcher` で保護対象ルートを指定する。（Next.js 16 で `middleware.ts` から改名）
- 管理者ガードはmiddlewareまたは各`layout.tsx`でセッションの`is_admin`を確認してリダイレクトする。

### File & Folder Conventions
```
app/
  layout.tsx          # ルートレイアウト
  page.tsx            # ホーム（動画一覧）
  login/
    page.tsx
  videos/
    [id]/
      page.tsx
  admin/
    layout.tsx        # 管理者チェックをここで行う
    page.tsx
    videos/
      new/page.tsx
      [id]/edit/page.tsx
  actions/            # Server Actions
lib/
  supabase/
    client.ts         # ブラウザ用クライアント (createBrowserClient)
    server.ts         # サーバー用クライアント (createServerClient)
proxy.ts              # 認証ガード（Next.js 16: middleware.ts から改名）
```

### Metadata
- 各`page.tsx`では `export const metadata` または `generateMetadata` でページタイトル・descriptionを設定する。

### Image & Font
- 画像は必ず `next/image` の `<Image>` を使う（`<img>` タグは使わない）。
- フォントは `next/font` 経由で読み込み済み（`app/layout.tsx`）。追加フォントも同様にする。

---

## Product Requirements (MVP)

### Overview
YouTube動画をUdemyライクなプラットフォームで配信するサービス。AI支援開発（ChatGPT、Claude、Cursor等）を学びたいエンジニア・非エンジニア向け。

### Tech Stack
- **Frontend**: Next.js (App Router) + Tailwind CSS → Vercel
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Video**: YouTube IFrame Player API（埋め込み）
- **Auth**: Google OAuth のみ（Supabase Auth経由）

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```
> 新形式のキー（`sb_publishable_xxx`）を使用。

### Key Libraries
- `@supabase/supabase-js` — Supabaseクライアント
- `@supabase/ssr` — Next.js App Router用SSRヘルパー
- `react-youtube` または YouTube IFrame API — 動画埋め込み

---

## Database Schema (Supabase)

### `users`
| column | type | notes |
|---|---|---|
| id | UUID PK | Supabase Authと連携（`auth.users.id` FK） |
| avatar_url | Text | Googleプロフィール画像URL |
| is_admin | Boolean NOT NULL | default: false |
| created_at | Timestamptz | |

> **注意**: `email` / `name` は `public.users` に保存しない。これらが必要な場合はサーバー側で `auth.users` の `email` / `raw_user_meta_data->>'full_name'` から取得する（セキュリティ対策）。

### `videos`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| title | String NOT NULL | |
| description | Text | |
| youtube_url | String NOT NULL | |
| thumbnail_url | String | Supabase Storageのパス |
| duration_minutes | Integer | 任意 |
| difficulty_level | String | beginner/intermediate/advanced |
| tags | Array\<String\> | 例: ["ChatGPT", "Next.js"] |
| order | Integer | 表示順 |
| created_at / updated_at | Timestamp | |
| created_by | UUID FK → users.id | |

### `progress`
| column | type | notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users.id | |
| video_id | UUID FK → videos.id | |
| progress_percentage | Integer 0-100 | 0=未視聴 / 1-99=視聴中 / 100=完了 |
| last_watched_at | Timestamp | |
| created_at / updated_at | Timestamp | |
| UNIQUE | (user_id, video_id) | |

### RLS Policies

すべてのテーブルで RLS を有効化済み（`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`）。

#### `users`
| policy | operation | 条件 |
|---|---|---|
| `users_select_own` | SELECT | 自分のレコードのみ（`auth.uid() = id`） |
| `users_update_own` | UPDATE | 自分のレコードのみ、かつ `is_admin` の変更不可 |
| `users_select_admin` | SELECT | 管理者は全ユーザーを読み取り可 |

> `is_admin` はユーザー自身では変更不可。昇格はDB直接操作のみ。

#### `videos`
| policy | operation | 条件 |
|---|---|---|
| `videos_select_authenticated` | SELECT | 認証済みユーザー全員 |
| `videos_insert_admin` | INSERT | 管理者のみ |
| `videos_update_admin` | UPDATE | 管理者のみ |
| `videos_delete_admin` | DELETE | 管理者のみ |

#### `progress`
| policy | operation | 条件 |
|---|---|---|
| `progress_select_own` | SELECT | 自分のレコードのみ |
| `progress_insert_own` | INSERT | 自分のレコードのみ |
| `progress_update_own` | UPDATE | 自分のレコードのみ |
| `progress_delete_own` | DELETE | 自分のレコードのみ |

### DB 関数・トリガー

| 名前 | 種類 | 説明 |
|---|---|---|
| `public.set_updated_at()` | Function | `updated_at` を自動更新（`videos` / `progress`） |
| `public.handle_new_user()` | Function | 新規サインアップ時に `public.users` へ自動挿入（`id` / `avatar_url` のみ、`SECURITY DEFINER`） |
| `videos_set_updated_at` | Trigger | `videos` の UPDATE 前に実行 |
| `progress_set_updated_at` | Trigger | `progress` の UPDATE 前に実行 |
| `on_auth_user_created` | Trigger | `auth.users` INSERT 後に `handle_new_user()` を実行 |

> 関数はすべて `SET search_path = ''` で固定済み（search_path インジェクション対策）。

---

## Routing & Access Control

| route | 認証 | 管理者 | 説明 |
|---|---|---|---|
| `/login` | 不要 | — | Googleログインボタンのみ |
| `/` or `/videos` | 必須 | — | 動画一覧（カード形式、進捗バー付き） |
| `/videos/[id]` | 必須 | — | YouTube埋め込み再生 + 進捗自動記録 |
| `/admin` | 必須 | 必須 | 動画一覧（編集・削除付き） |
| `/admin/videos/new` | 必須 | 必須 | 動画新規追加フォーム |
| `/admin/videos/[id]/edit` | 必須 | 必須 | 動画編集フォーム |

- 未認証ユーザーは `/login` にリダイレクト
- 管理者でないユーザーが `/admin` 以下にアクセスした場合は `/` にリダイレクト
- 管理者フラグは `users.is_admin` で管理

---

## MVP Development Phases

### Phase 1（最優先）
1. ~~Supabaseプロジェクトセットアップ + テーブル作成 + RLS設定~~ **完了**
2. Google OAuth設定（Google Cloud Console + Supabase Auth）
3. 認証フロー実装（ログイン・ログアウト・ルートガード）
4. 基本レイアウト

### Phase 2
5. 動画リスト画面
6. YouTube埋め込み再生画面

### Phase 3
7. 視聴進捗記録機能
8. 管理画面（動画CRUD + サムネイルアップロード）

### Out of Scope (MVP後)
課金（Stripe）、コメント、検索、お気に入り、修了証、メール通知、コードスニペット共有、プロンプトテンプレート集、Q&Aフォーラム
