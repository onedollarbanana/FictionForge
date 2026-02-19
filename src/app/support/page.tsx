import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Ticket, Plus, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CATEGORY_LABELS,
  type SupportTicket,
  type TicketStatus,
  type TicketCategory,
} from '@/lib/support'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SupportPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let tickets: SupportTicket[] = []
  if (user) {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    tickets = (data as SupportTicket[]) || []
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <Ticket className="h-10 w-10 text-primary mx-auto mb-3" />
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-muted-foreground">
          Need help? Submit a ticket and our team will get back to you.
        </p>
      </div>

      <div className="flex justify-center mb-10">
        <Button asChild size="lg">
          <Link href="/support/new">
            <Plus className="h-4 w-4 mr-2" />
            Submit a Ticket
          </Link>
        </Button>
      </div>

      {user ? (
        <Card>
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
            <CardDescription>
              {tickets.length === 0
                ? 'You haven\'t submitted any tickets yet.'
                : `You have ${tickets.length} ticket${tickets.length === 1 ? '' : 's'}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No tickets yet. Click &quot;Submit a Ticket&quot; above if you need help.
              </p>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/support/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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
                        <span className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[ticket.category as TicketCategory]}
                        </span>
                      </div>
                      <p className="font-medium truncate">{ticket.subject}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in to view your tickets or submit a new one.
            </p>
            <Button asChild variant="outline">
              <Link href="/auth/login?redirect=/support">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
