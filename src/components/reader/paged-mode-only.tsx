'use client'

import { ReactNode } from 'react'
import { useReadingSettings } from '@/lib/hooks/useReadingSettings'

interface PagedModeOnlyProps {
  children: ReactNode
}

export function PagedModeOnly({ children }: PagedModeOnlyProps) {
  const { settings, isLoaded } = useReadingSettings()
  
  // Show children while loading (default is paged) and when mode is paged
  if (!isLoaded || settings.readingMode === 'paged') {
    return <>{children}</>
  }
  
  return null
}
