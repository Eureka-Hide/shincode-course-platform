import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signInWithGoogle } from '@/app/actions/auth'

export const metadata = {
  title: 'ログイン | ShinCode Course',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">

      {/* 背景: 紫グラデーション */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(124,58,237,0.3),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_85%,rgba(59,130,246,0.15),transparent)]" />

      {/* 背景: グリッドパターン */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* カード */}
      <div className="relative w-full max-w-sm">
        <div className="bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/60">

          {/* ロゴマーク */}
          <div className="flex justify-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-xl shadow-violet-600/30">
              <span className="text-white font-bold text-2xl tracking-tight">S</span>
            </div>
          </div>

          {/* タイトル */}
          <div className="text-center mb-8 space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ShinCode Course
            </h1>
            <p className="text-sm text-zinc-400">
              AI 支援開発を学ぶプラットフォーム
            </p>
          </div>

          {/* 区切り */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[11px] text-zinc-600 tracking-wider uppercase">Sign in</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Googleログインボタン */}
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-900 font-semibold text-sm rounded-xl transition-all duration-150 shadow-lg shadow-black/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              <GoogleIcon />
              Google でログイン
            </button>
          </form>

          {/* 注記 */}
          <p className="text-center text-[11px] text-zinc-600 mt-6 leading-relaxed">
            ログインすることで利用規約に<br />同意したものとみなします
          </p>
        </div>

        {/* カード外の光沢 */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  )
}
