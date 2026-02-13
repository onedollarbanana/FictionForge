'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Pause, CheckCircle, Archive, Library, ArrowUpDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const statusTabs = [
  { key: 'all', label: 'All', icon: Library },
  { key: 'reading', label: 'Reading', icon: BookOpen },
  { key: 'plan_to_read', label: 'Plan to Read', icon: Clock },
  { key: 'on_hold', label: 'On Hold', icon: Pause },
  { key: 'finished', label: 'Finished', icon: CheckCircle },
  { key: 'dropped', label: 'Dropped', icon: Archive },
]

const sortOptions = [
  { key: 'updated', label: 'Recently Updated' },
  { key: 'title', label: 'Title A-Z' },
  { key: 'added', label: 'Date Added' },
  { key: 'progress', label: 'Progress' },
]

interface LibraryFiltersProps {
  currentStatus: string
  currentSort: string
  counts: Record<string, number>
}

export function LibraryFilters({ currentStatus, currentSort, counts }: LibraryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close sort dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const updateParams = (status?: string, sort?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status !== undefined) {
      if (status === 'all') {
        params.delete('status')
      } else {
        params.set('status', status)
      }
    }
    if (sort !== undefined) {
      if (sort === 'updated') {
        params.delete('sort')
      } else {
        params.set('sort', sort)
      }
    }
    router.push(`/library?${params.toString()}`)
  }

  const currentSortLabel = sortOptions.find(s => s.key === currentSort)?.label || 'Recently Updated'

  return (
    <div className="space-y-4">
      {/* Status tabs - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-hide">
        {statusTabs.map((tab) => {
          const Icon = tab.icon
          const count = tab.key === 'all' ? counts.total : (counts[tab.key] || 0)
          const isActive = currentStatus === tab.key

          return (
            <Button
              key={tab.key}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateParams(tab.key)}
              className="shrink-0 gap-2"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              <span className="text-xs opacity-70">({count})</span>
            </Button>
          )
        })}
      </div>

      {/* Sort dropdown */}
      <div className="flex justify-end" ref={sortRef}>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOpen(!sortOpen)}
            className="gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            <span className="hidden sm:inline">Sort: </span>
            {currentSortLabel}
          </Button>

          {sortOpen && (
            <div className="absolute top-full mt-1 right-0 z-50 min-w-[180px] bg-white dark:bg-zinc-900 border border-border rounded-md shadow-lg py-1">
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    updateParams(undefined, option.key)
                    setSortOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-left hover:bg-muted transition-colors ${
                    currentSort === option.key ? 'bg-muted font-medium' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
