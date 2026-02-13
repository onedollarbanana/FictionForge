'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Loader2, Check, BookOpen, Clock, Archive, X, Bookmark, Pause, CheckCircle, Bell, BellOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/toast'

interface StatusDropdownProps {
  storyId: string
  currentStatus: string | null
  notifyNewChapters?: boolean
  onStatusChange: (newStatus: string | null) => void
  onNotifyChange?: (notify: boolean) => void
}

type FollowStatus = 'reading' | 'plan_to_read' | 'on_hold' | 'finished' | 'dropped' | null

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; defaultNotify: boolean }> = {
  reading: { label: 'Reading', icon: <BookOpen className="h-4 w-4" />, color: 'text-green-500', defaultNotify: true },
  plan_to_read: { label: 'Plan to Read', icon: <Clock className="h-4 w-4" />, color: 'text-blue-500', defaultNotify: false },
  on_hold: { label: 'On Hold', icon: <Pause className="h-4 w-4" />, color: 'text-amber-500', defaultNotify: true },
  finished: { label: 'Finished', icon: <CheckCircle className="h-4 w-4" />, color: 'text-purple-500', defaultNotify: false },
  dropped: { label: 'Dropped', icon: <Archive className="h-4 w-4" />, color: 'text-gray-500', defaultNotify: false },
}

export function StatusDropdown({ 
  storyId, 
  currentStatus, 
  notifyNewChapters = true,
  onStatusChange,
  onNotifyChange 
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notify, setNotify] = useState(notifyNewChapters)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync notify state with prop
  useEffect(() => {
    setNotify(notifyNewChapters)
  }, [notifyNewChapters])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStatusSelect = async (status: FollowStatus) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        showToast('Please sign in to manage your library', 'error')
        return
      }

      if (status === null) {
        // Remove from library (delete follow)
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', storyId)
        
        if (error) throw error
        showToast('Removed from library', 'success')
      } else {
        // Get smart default for notifications
        const newNotify = statusConfig[status].defaultNotify

        // Check if follow exists
        const { data: existing } = await supabase
          .from('follows')
          .select('id')
          .eq('user_id', user.id)
          .eq('story_id', storyId)
          .maybeSingle()

        if (existing) {
          // Update existing follow with smart notification default
          const { error } = await supabase
            .from('follows')
            .update({ 
              status, 
              notify_new_chapters: newNotify,
              updated_at: new Date().toISOString() 
            })
            .eq('user_id', user.id)
            .eq('story_id', storyId)
          
          if (error) throw error
        } else {
          // Create new follow with smart notification default
          const { error } = await supabase
            .from('follows')
            .insert({
              user_id: user.id,
              story_id: storyId,
              status,
              notify_new_chapters: newNotify,
            })
          
          if (error) throw error
        }
        
        setNotify(newNotify)
        onNotifyChange?.(newNotify)
        showToast(`Status updated to ${statusConfig[status].label}`, 'success')
      }
      
      onStatusChange(status)
    } catch (error) {
      console.error('Error updating status:', error)
      showToast('Failed to update status', 'error')
    } finally {
      setLoading(false)
      setIsOpen(false)
    }
  }

  const handleToggleNotifications = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        showToast('Please sign in', 'error')
        return
      }

      const newNotify = !notify
      
      const { error } = await supabase
        .from('follows')
        .update({ notify_new_chapters: newNotify })
        .eq('user_id', user.id)
        .eq('story_id', storyId)
      
      if (error) throw error
      
      setNotify(newNotify)
      onNotifyChange?.(newNotify)
      showToast(newNotify ? 'Notifications enabled' : 'Notifications disabled', 'success')
    } catch (error) {
      console.error('Error toggling notifications:', error)
      showToast('Failed to update notifications', 'error')
    }
  }

  const currentConfig = currentStatus ? statusConfig[currentStatus] : null

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="min-w-[140px] justify-between"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : currentConfig ? (
          <span className={`flex items-center gap-2 ${currentConfig.color}`}>
            {currentConfig.icon}
            {currentConfig.label}
            {currentStatus && (
              notify ? (
                <Bell className="h-3 w-3 text-primary ml-1" />
              ) : (
                <BellOff className="h-3 w-3 text-muted-foreground ml-1" />
              )
            )}
          </span>
        ) : (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Bookmark className="h-4 w-4" />
            Add to Library
          </span>
        )}
        <ChevronDown className="h-4 w-4 ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute top-full mt-1 right-0 z-50 min-w-[180px] bg-white dark:bg-zinc-900 border border-border rounded-md shadow-lg py-1">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleStatusSelect(key as FollowStatus)}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors ${
                currentStatus === key ? 'bg-muted' : ''
              }`}
            >
              <span className={config.color}>{config.icon}</span>
              <span className="flex-1">{config.label}</span>
              {currentStatus === key && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
          
          {currentStatus && (
            <>
              <div className="border-t my-1" />
              
              {/* Notification toggle */}
              <button
                onClick={handleToggleNotifications}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
              >
                {notify ? (
                  <Bell className="h-4 w-4 text-primary" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1">Chapter updates</span>
                {notify && <Check className="h-4 w-4 text-primary" />}
              </button>
              
              <div className="border-t my-1" />
              
              <button
                onClick={() => handleStatusSelect(null)}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors text-destructive"
              >
                <X className="h-4 w-4" />
                <span>Remove from Library</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
