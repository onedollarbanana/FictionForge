'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  BookOpen,
  MessageSquare,
  Star,
  MessageCircle,
  UserPlus,
  Trophy,
  Megaphone,
  Info,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '@/lib/notifications'

function getTypeIcon(type: string) {
  switch (type) {
    case 'new_chapter': return <BookOpen className="h-5 w-5" />
    case 'comment_reply': return <MessageSquare className="h-5 w-5" />
    case 'new_review': return <Star className="h-5 w-5" />
    case 'new_comment': return <MessageCircle className="h-5 w-5" />
    case 'new_follower': return <UserPlus className="h-5 w-5" />
    case 'achievement': return <Trophy className="h-5 w-5" />
    case 'announcement': return <Megaphone className="h-5 w-5" />
    case 'system': return <Info className="h-5 w-5" />
    default: return <Bell className="h-5 w-5" />
  }
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const data = await getNotifications(PAGE_SIZE, 0)
        setNotifications(data)
        setHasMore(data.length === PAGE_SIZE)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const data = await getNotifications(PAGE_SIZE, notifications.length)
      setNotifications((prev) => [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      )
    }
    if (notification.link) {
      router.push(notification.link)
    }
  }

  const hasUnread = notifications.some((n) => !n.is_read)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {hasUnread && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                !notification.is_read ? 'border-l-2 border-l-primary' : ''
              }`}
              onClick={() => handleClick(notification)}
            >
              <div className="flex items-start gap-4 p-4">
                <span className="mt-0.5 text-muted-foreground shrink-0">
                  {getTypeIcon(notification.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{notification.title}</p>
                  {notification.message && (
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {relativeTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
