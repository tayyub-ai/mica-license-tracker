import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/admin/LogoutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b-2 border-rule-bold bg-paper-2 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-display text-lg font-semibold text-ink hover:text-oxblood transition-colors">
          MiCA<span className="text-oxblood">·</span>Tracker Admin
        </Link>
        <div className="flex items-center gap-4">
          <span className="eyebrow normal-case tracking-normal">{user.email}</span>
          <LogoutButton />
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  )
}
