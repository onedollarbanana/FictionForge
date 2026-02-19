'use client'

import { BookOpen } from 'lucide-react'

interface ResumeToastProps {
  show: boolean
}

export function ResumeToast({ show }: ResumeToastProps) {
  if (!show) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg text-sm font-medium">
        <BookOpen className="h-4 w-4" />
        Resuming where you left off
      </div>
    </div>
  )
}
