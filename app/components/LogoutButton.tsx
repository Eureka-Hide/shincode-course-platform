'use client'

import { signOut } from '@/app/actions/auth'

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/60 transition-all duration-150"
      >
        ログアウト
      </button>
    </form>
  )
}
