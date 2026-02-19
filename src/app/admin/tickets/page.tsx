import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CATEGORY_LABELS,
  PRIORITY_COLORS,
  type SupportTicket,
  type TicketStatus,
  type TicketCategory,
  type TicketPriority,
} from '@/lib/support'
import { cn } from '@/lib/utils'
import { Clock, ArrowRight } from 'lucide-react'
import AdminTicketsFilter from './admin-tickets-filter'

export const dynamic = 'force-dynamic'

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: filterStatus } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus)
  }

  const { data: tickets } = await query
  const allTickets = (tickets as SupportTicket[]) || []

  // Get counts for tabs
  const { data: countData } = await supabase
    .from('support_tickets')
    .select('status')

  const counts: Record<string, number> = { all: 0 }
  ;(countData || []).forEach((t: any) => {
    counts.all = (counts.all || 0) + 1
    counts[t.status] = (counts[t.status] || 0) + 1
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-sm text-muted-foreground">{counts.all || 0} total tickets</p>
        </div>
      </div>

      <AdminTicketsFilter currentStatus={filterStatus || 'all'} counts={counts} />

      <div className="space-y-3 mt-6">
        {allTickets.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No tickets found.
            </CardContent>
          </Card>
        ) : (
          allTickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/tickets/${ticket.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors group block"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    #{ticket.ticket_number}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_COLORS[ticket.status as TicketStatus]
                    )}
                  >
                    {STATUS_LABELS[ticket.status as TicketStatus]}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[ticket.category as TicketCategory]}
                  </Badge>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      PRIORITY_COLORS[ticket.priority as TicketPriority]
                    )}
                  >
                    {(ticket.priority as string).charAt(0).toUpperCase() + (ticket.priority as string).slice(1)}
                  </span>
                </div>
                <p className="font-medium truncate">{ticket.subject}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                  {ticket.email && <span>{ticket.email}</span>}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
