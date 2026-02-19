import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TicketDetailClient from './ticket-detail-client'

export const dynamic = 'force-dynamic'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirect=/support')

  const { data: ticket } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', id)
    .single()

  if (!ticket) notFound()

  const { data: responses } = await supabase
    .from('ticket_responses')
    .select('*')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  return (
    <TicketDetailClient
      ticket={ticket}
      responses={responses || []}
      userId={user.id}
    />
  )
}
