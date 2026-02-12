'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Settings, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ReadingSettingsPanel } from './reading-settings-panel'
import { useReadingSettings, widthClasses } from '@/lib/hooks/useReadingSettings'

interface MobileChapterNavProps {
  storyId: string
  storyTitle: string
  prevChapter: { id: string; title: string } | null
  nextChapter: { id: string; title: string } | null
  currentChapterNumber: number
  totalChapters: number
}

// Theme-specific inline styles (for non-auto themes)
const themeInlineStyles: Record<'light' | 'dark' | 'sepia' | 'night', { bg: string; text: string; borderColor: string }> = {
  light: { bg: '#ffffff', text: '#18181b', borderColor: '#e4e4e7' },
  dark: { bg: '#18181b', text: '#f4f4f5', borderColor: '#3f3f46' },
  sepia: { bg: '#fffbeb', text: '#451a03', borderColor: '#fde68a' },
  night: { bg: '#000000', text: '#d4d4d8', borderColor: '#27272a' },
}

export function MobileChapterNav({
  storyId,
  storyTitle,
  prevChapter,
  nextChapter,
  currentChapterNumber,
  totalChapters,
}: MobileChapterNavProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { settings, updateSettings, resetSettings } = useReadingSettings()
  
  const isAutoTheme = settings.theme === 'auto'
  const explicitTheme = !isAutoTheme ? themeInlineStyles[settings.theme] : null
  const widthClass = widthClasses[settings.width]

  return (
    <>
      {/* Fixed bottom navigation bar - mobile only */}
      <nav 
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t safe-area-bottom ${
          isAutoTheme 
            ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700' 
            : ''
        }`}
        style={explicitTheme ? { 
          backgroundColor: explicitTheme.bg,
          borderColor: explicitTheme.borderColor 
        } : undefined}
      >
        {/* Inner container matches content width */}
        <div className={`container mx-auto px-2 ${widthClass}`}>
          <div className="flex items-center justify-between py-2">
            {/* Previous Chapter */}
            {prevChapter ? (
              <Link href={`/story/${storyId}/chapter/${prevChapter.id}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${
                    isAutoTheme 
                      ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800' 
                      : ''
                  }`}
                  style={explicitTheme ? { color: explicitTheme.text } : undefined}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">Prev</span>
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" disabled className="opacity-30">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Prev</span>
              </Button>
            )}

            {/* Chapter indicator & TOC link */}
            <Link 
              href={`/story/${storyId}`}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                isAutoTheme 
                  ? 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400' 
                  : ''
              }`}
              style={explicitTheme ? { color: explicitTheme.text } : undefined}
            >
              <List className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentChapterNumber} / {totalChapters}
              </span>
            </Link>

            {/* Settings button - opens sheet */}
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={isAutoTheme 
                    ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800' 
                    : ''
                  }
                  style={explicitTheme ? { color: explicitTheme.text } : undefined}
                >
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900">
                <SheetHeader>
                  <SheetTitle className="text-zinc-900 dark:text-zinc-100">Reading Settings</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <ReadingSettingsPanel
                    settings={settings}
                    onUpdateSettings={updateSettings}
                    onResetSettings={resetSettings}
                    embedded
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Next Chapter */}
            {nextChapter ? (
              <Link href={`/story/${storyId}/chapter/${nextChapter.id}`}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${
                    isAutoTheme 
                      ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800' 
                      : ''
                  }`}
                  style={explicitTheme ? { color: explicitTheme.text } : undefined}
                >
                  <span className="sr-only sm:not-sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" disabled className="opacity-30">
                <span className="sr-only sm:not-sr-only">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
