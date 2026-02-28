# 001 — Supabase プロジェクトセットアップ・DB・RLS

**Phase**: 1
**状態**: [完了]

## 概要
Supabase プロジェクトを作成し、DB テーブルと RLS ポリシーを設定する。
アプリが動作するための基盤となるチケット。

---

## TODO

### プロジェクト作成・環境変数
- [x] [database.new](https://database.new) で Supabase プロジェクトを作成
- [x] `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` を取得
- [x] `.env.local` を作成して環境変数を設定
- [x] `@supabase/supabase-js` と `@supabase/ssr` をインストール

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### `users` テーブル作成
- [x] Supabase SQL Editor で `users` テーブルを作成

```sql
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamp with time zone default now()
);
```
> **注意**: `email` / `name` は保存しない。必要な場合はサーバー側で `auth.users` から取得する（セキュリティ対策）。

- [x] ログイン時に `users` テーブルへ自動挿入する Function + Trigger を作成

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = '';
```
> **注意**: `name` も保存しない。表示名が必要な場合は `auth.users.raw_user_meta_data->>'full_name'` からサーバー側で取得する。

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### `videos` テーブル作成
- [x] `videos` テーブルを作成

```sql
create table public.videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  youtube_url text not null,
  thumbnail_url text,
  duration_minutes integer,
  difficulty_level text check (difficulty_level in ('beginner', 'intermediate', 'advanced')),
  tags text[],
  "order" integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references public.users(id)
);
```

### `progress` テーブル作成
- [x] `progress` テーブルを作成

```sql
create table public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  video_id uuid references public.videos(id) on delete cascade not null,
  progress_percentage integer default 0 check (progress_percentage between 0 and 100),
  last_watched_at timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, video_id)
);
```

### RLS ポリシー設定
- [x] 全テーブルで RLS を有効化

```sql
alter table public.users enable row level security;
alter table public.videos enable row level security;
alter table public.progress enable row level security;
```

- [x] `users` テーブルのポリシー設定

```sql
-- 自分のデータのみ参照・更新可能
create policy "users: select own" on public.users for select using (auth.uid() = id);
create policy "users: update own" on public.users for update using (auth.uid() = id);
```

- [x] `videos` テーブルのポリシー設定

```sql
-- 認証済みユーザー全員が読み取り可能
create policy "videos: select authenticated" on public.videos
  for select using (auth.role() = 'authenticated');

-- 管理者のみ書き込み可能
create policy "videos: insert admin" on public.videos
  for insert with check ((select is_admin from public.users where id = auth.uid()));

create policy "videos: update admin" on public.videos
  for update using ((select is_admin from public.users where id = auth.uid()));

create policy "videos: delete admin" on public.videos
  for delete using ((select is_admin from public.users where id = auth.uid()));
```

- [x] `progress` テーブルのポリシー設定

```sql
-- 自分のデータのみ操作可能
create policy "progress: select own" on public.progress for select using (auth.uid() = user_id);
create policy "progress: insert own" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress: update own" on public.progress for update using (auth.uid() = user_id);
create policy "progress: delete own" on public.progress for delete using (auth.uid() = user_id);
```

### Supabase Storage 設定
- [x] サムネイル用の Storage バケット `thumbnails` を作成（public）
- [x] バケットのポリシーを設定（管理者のみアップロード可、全員が読み取り可）

---

## 完了条件
- Supabase ダッシュボードで 3 テーブルが確認できる
- RLS ポリシーが各テーブルに設定されている
- `.env.local` に環境変数が設定されている
