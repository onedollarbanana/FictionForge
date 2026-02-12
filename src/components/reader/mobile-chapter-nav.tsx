'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, List, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { ReadingSettingsPanel } from './reading-settings-panel'
import { useReadingSettings } from '@/lib/hooks/useReadingSettings'

interface MobileChapterNavProps {
  storyId: string
  currentChapter: number
  totalChapters: number
  prevChapterId?: string
  nextChapterId?: string
}

export function MobileChapterNav({
  storyId,
  currentChapter,
  totalChapters,
  prevChapterId,
  nextChapterId,
}: MobileChapterNavProps) {
  const { settings, updateSettings, resetSettings, isLoaded } = useReadingSettings()
  const [showSettings, setShowSettings] = useState(false)

  if (!isLoaded) return null

  return (
    <>
      {/* Mobile Bottom Navigation Bar - only shows on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {/* Previous Chapter */}
          {prevChapterId ? (
            <Link
              href={`/story/${storyId}/chapter/${prevChapterId}`}
              className="flex flex-col items-center justify-center flex-1 h-full text-zinc-600 dark:text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Previous</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 h-full text-zinc-300 dark:text-zinc-700">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Previous</span>
            </div>
          )}

          {/* Chapter List / Story Page */}
          <Link
            href={`/story/${storyId}`}
            className="flex flex-col items-center justify-center flex-1 h-full text-zinc-600 dark:text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800"
          >
            <List className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">{currentChapter}/{totalChapters}</span>
          </Link>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-zinc-600 dark:text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800"
          >
            <Settings2 className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">Settings</span>
          </button>

          {/* Next Chapter */}
          {nextChapterId ? (
            <Link
              href={`/story/${storyId}/chapter/${nextChapterId}`}
              className="flex flex-col items-center justify-center flex-1 h-full text-zinc-600 dark:text-zinc-400 active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              <ChevronRight className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Next</span>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 h-full text-zinc-300 dark:text-zinc-700">
              <ChevronRight className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Next</span>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Settings Sheet */}
      {showSettings && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSettings(false)}
          />
          
          {/* Settings Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-2xl max-h-[80vh] overflow-y-auto safe-area-bottom">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Reading Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 p-2 -mr-2"
                >
                  Done
                </button>
              </div>
              
              <ReadingSettingsPanel
                settings={settings}
                onUpdateSettings={updateSettings}
                onResetSettings={resetSettings}
                isMobileSheet={true}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Spacer to prevent content from being hidden behind bottom nav on mobile */}
      <div className="md:hidden h-14" />
    </>
  )
}
