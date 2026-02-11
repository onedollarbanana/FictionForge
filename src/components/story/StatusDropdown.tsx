'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown, Loader2, Check, BookOpen, Clock, Archive, X, Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/toast'

interface StatusDropdownProps {
  storyId: string
  currentStatus: string | null
  onStatusChange: (newStatus: string | null) => void
}

type ReadingStatus = 'reading' | 'plan_to_read' | 'finished' | 'dropped' | null

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  reading: { label: 'Reading', icon: <BookOpen className="h-4 w-4" />, color: 'text-green-500' },
  plan_to_read: { label: 'Plan to Read', icon: <Clock className="h-4 w-4" />, color: 'text-blue-500' },
  finished: { label: 'Finished', icon: <Check className="h-4 w-4" />, color: 'text-purple-500' },
  dropped: { label: 'Dropped', icon: <Archive className="h-4 w-4" />, color: 'text-gray-500' },
}

export function StatusDropdown({ storyId, currentStatus, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const handleStatusSelect = async (status: ReadingStatus) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        showToast('Please sign in to manage your library', 'error')
        return
      }

      if (status === null) {
        // Remove from library
        const { error } = await supabase
          .from('library')
          .delete()
          .eq('user_id', user.id)
          .eq('story_id', storyId)
        
        if (error) throw error
        showToast('Removed from library', 'success')
      } else {
        // Upsert library entry
        const { error } = await supabase
          .from('library')
          .upsert({
            user_id: user.id,
            story_id: storyId,
            status,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,story_id'
          })
        
        if (error) throw error
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
        <div className="absolute top-full mt-1 right-0 z-50 min-w-[160px] bg-background border border-border rounded-md shadow-lg py-1">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => handleStatusSelect(key as ReadingStatus)}
              className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors ${
                currentStatus === key ? 'bg-muted' : ''
              }`}
            >
              <span className={config.color}>{config.icon}</span>
              <span>{config.label}</span>
              {currentStatus === key && <Check className="h-4 w-4 ml-auto text-primary" />}
            </button>
          ))}
          
          {currentStatus && (
            <>
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
