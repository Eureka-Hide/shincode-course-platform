import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/app/components/Header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </main>
    </div>
  )
}
