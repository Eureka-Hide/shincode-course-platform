import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin, avatar_url')
    .eq('id', user!.id)
    .single()

  const isAdmin = profile?.is_admin ?? false
  const avatarUrl = profile?.avatar_url ?? null
  const avatarLetter = user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">

        {/* ロゴ + ナビ */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-white tracking-tight text-sm">
              ShinCode Course
            </span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors px-2.5 py-1 rounded-md hover:bg-zinc-800"
            >
              管理画面
            </Link>
          )}
        </div>

        {/* ユーザーエリア */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="avatar"
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {avatarLetter}
              </div>
            )}
            <span className="text-xs text-zinc-500 hidden sm:block">
              {user?.email}
            </span>
          </div>
          <div className="w-px h-4 bg-zinc-700" />
          <LogoutButton />
        </div>

      </div>
    </header>
  )
}
