import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has a profile with username set
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile || profile.username.startsWith('user_')) {
    redirect('/create-profile')
  }

  // Just render children - root layout provides the header
  return <>{children}</>
}
