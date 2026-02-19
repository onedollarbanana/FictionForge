'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'waiting_on_user', label: 'Waiting' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
]

interface Props {
  currentStatus: string
  counts: Record<string, number>
}

export default function AdminTicketsFilter({ currentStatus, counts }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() =>
            router.push(
              tab.key === 'all'
                ? '/admin/tickets'
                : `/admin/tickets?status=${tab.key}`
            )
          }
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            currentStatus === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-accent'
          )}
        >
          {tab.label}
          {counts[tab.key] !== undefined && (
            <span className="ml-1.5 text-xs opacity-70">({counts[tab.key]})</span>
          )}
        </button>
      ))}
    </div>
  )
}
