import { createClient } from '@/lib/supabase/client'

export type TicketCategory = 'bug' | 'feature_request' | 'account' | 'content' | 'technical' | 'other'
export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_user' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SupportTicket {
  id: string
  ticket_number: number
  user_id: string | null
  email: string | null
  category: TicketCategory
  priority: TicketPriority
  subject: string
  description: string
  screenshot_url: string | null
  status: TicketStatus
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface TicketResponse {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_admin: boolean
  created_at: string
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  bug: 'Bug Report',
  feature_request: 'Feature Request',
  account: 'Account Issue',
  content: 'Content Issue',
  technical: 'Technical Problem',
  other: 'Other',
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting_on_user: 'Waiting on You',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const STATUS_COLORS: Record<TicketStatus, string> = {
  open: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-yellow-500/10 text-yellow-500',
  waiting_on_user: 'bg-orange-500/10 text-orange-500',
  resolved: 'bg-green-500/10 text-green-500',
  closed: 'bg-muted text-muted-foreground',
}

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-red-500/10 text-red-500',
}
