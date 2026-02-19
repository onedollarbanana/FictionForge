'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    const { data: t } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single()
    setTicket(t as SupportTicket | null)

    const { data: r } = await supabase
      .from('ticket_responses')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })
    setResponses((r as TicketResponse[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [ticketId])

  async function updateField(field: string, value: string) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ [field]: value })
      .eq('id', ticketId)
    if (error) {
      showToast('Failed to update ticket.', 'error')
    } else {
      showToast('Ticket updated.', 'success')
      loadData()
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('ticket_responses').insert({
        ticket_id: ticketId,
        user_id: user.id,
        message: reply.trim(),
        is_admin: true,
      })
      if (error) throw error
      showToast('Reply sent!', 'success')
      setReply('')
      loadData()
    } catch (err: any) {
      showToast(err.message || 'Failed to send reply.', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading ticket...</p>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Ticket not found.</p>
      </div>
    )
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/tickets">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tickets
        </Link>
      </Button>

      {/* Ticket header */}
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
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(ticket.created_at).toLocaleString()}
            </span>
            {ticket.email && <span>Email: {ticket.email}</span>}
            {ticket.user_id && (
              <Link
                href={`/profile/${ticket.user_id}`}
                className="text-primary underline text-xs"
              >
                View User Profile
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm mb-6">{ticket.description}</p>

          {/* Admin controls */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select
                value={ticket.status}
                onValueChange={(v) => updateField('status', v)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <Select
                value={ticket.priority}
                onValueChange={(v) => updateField('priority', v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                    {resp.is_admin ? 'Admin' : 'User'}
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

      {/* Admin reply */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleReply} className="space-y-3">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write an admin reply..."
              rows={4}
            />
            <div className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => updateField('status', 'closed')}
              >
                Close Ticket
              </Button>
              <Button type="submit" disabled={sending || !reply.trim()}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
