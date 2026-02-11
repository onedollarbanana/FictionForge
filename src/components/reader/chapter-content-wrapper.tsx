'use client'

import { ReactNode } from 'react'
import { ReadingSettingsPanel } from './reading-settings-panel'
import {
  useReadingSettings,
  fontFamilyClasses,
  lineHeightClasses,
  widthClasses,
  themeStyles,
} from '@/lib/hooks/useReadingSettings'

interface ChapterContentWrapperProps {
  children: ReactNode
  headerContent: ReactNode
}

export function ChapterContentWrapper({ children, headerContent }: ChapterContentWrapperProps) {
  const { settings, updateSettings, resetSettings, isLoaded } = useReadingSettings()

  // Don't render until settings are loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-8 max-w-3xl mx-auto">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2 mb-8" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  const theme = themeStyles[settings.theme]
  const fontClass = fontFamilyClasses[settings.fontFamily]
  const lineHeightClass = lineHeightClasses[settings.lineHeight]
  const widthClass = widthClasses[settings.width]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg} ${theme.text}`}>
      {/* Compact Header with Settings Button */}
      <div className={`border-b sticky top-0 z-10 backdrop-blur ${theme.bg}/95 ${theme.border}`}>
        <div className={`container mx-auto px-4 py-3 ${widthClass}`}>
          <div className="flex items-center justify-between">
            {headerContent}
            <ReadingSettingsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetSettings={resetSettings}
            />
          </div>
        </div>
      </div>

      {/* Chapter Content with Applied Settings */}
      <article 
        className={`container mx-auto px-4 py-8 ${widthClass} ${fontClass} ${lineHeightClass}`}
        style={{ fontSize: `${settings.fontSize}px` }}
      >
        {children}
      </article>
    </div>
  )
}
