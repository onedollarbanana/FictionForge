'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send, Clock, User, Shield } from 'lucide-react'
import { showToast } from '@/components/ui/toast'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  CATEGORY_LABELS,
  PRIORITY_COLORS,
  type SupportTicket,
  type TicketResponse,
  type TicketStatus,
  type TicketCategory,
  type TicketPriority,
} from '@/lib/support'
import { cn } from '@/lib/utils'

interface Props {
  ticket: SupportTicket
  responses: TicketResponse[]
  userId: string
}

export default function TicketDetailClient({ ticket, responses, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const isClosed = ticket.status === 'closed'

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      const { error } = await supabase.from('ticket_responses').insert({
        ticket_id: ticket.id,
        user_id: userId,
        message: reply.trim(),
        is_admin: false,
      })
      if (error) throw error
      showToast('Reply sent!', 'success')
      setReply('')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply.', 'error')
    } finally {
      setSending(false)
    }
  }

  async function updateStatus(newStatus: TicketStatus) {
    setUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticket.id)
      if (error) throw error
      showToast(`Ticket ${newStatus === 'closed' ? 'closed' : 'reopened'}.`, 'success')
      router.refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to update ticket.', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/support">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Support
        </Link>
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm text-muted-foreground font-mono">
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
            <Badge variant="outline">
              {CATEGORY_LABELS[ticket.category as TicketCategory]}
            </Badge>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                PRIORITY_COLORS[ticket.priority as TicketPriority]
              )}
            >
              {(ticket.priority as string).charAt(0).toUpperCase() + (ticket.priority as string).slice(1)} Priority
            </span>
          </div>
          <CardTitle>{ticket.subject}</CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Submitted {new Date(ticket.created_at).toLocaleString()}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Responses */}
      {responses.length > 0 && (
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Responses
          </h3>
          {responses.map((resp) => (
            <Card
              key={resp.id}
              className={cn(resp.is_admin && 'border-primary/20 bg-primary/5')}
            >
              <CardContent className="py-4">
                <div className="flex items-center gap-2 mb-2">
                  {resp.is_admin ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {resp.is_admin ? 'Support Team' : 'You'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(resp.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{resp.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reply form */}
      {!isClosed ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleReply} className="space-y-3">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                rows={4}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {ticket.status === 'resolved' && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updatingStatus}
                        onClick={() => updateStatus('closed')}
                      >
                        Close Ticket
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={updatingStatus}
                        onClick={() => updateStatus('open')}
                      >
                        Reopen
                      </Button>
                    </>
                  )}
                </div>
                <Button type="submit" disabled={sending || !reply.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            This ticket is closed. If you need further help, please{' '}
            <Link href="/support/new" className="text-primary underline">
              submit a new ticket
            </Link>
            .
          </CardContent>
        </Card>
      )}
    </div>
  )
}
