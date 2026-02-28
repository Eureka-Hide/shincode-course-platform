import Header from '@/app/components/Header'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10">
        {children}
      </main>
    </div>
  )
}
