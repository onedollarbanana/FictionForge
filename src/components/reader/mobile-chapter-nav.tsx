'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, List, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { ReadingSettingsPanel } from './reading-settings-panel'
import { useReadingSettings, themeStyles, widthClasses } from '@/lib/hooks/useReadingSettings'

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
  const { settings, resolvedTheme, updateSettings, resetSettings, isLoaded } = useReadingSettings()
  const [showSettings, setShowSettings] = useState(false)

  if (!isLoaded) return null

  const theme = themeStyles[resolvedTheme]
  const widthClass = widthClasses[settings.width]
  
  // Colors based on reading theme
  const textColor = resolvedTheme === 'light' || resolvedTheme === 'sepia' 
    ? 'text-zinc-600' 
    : 'text-zinc-400'
  const disabledColor = resolvedTheme === 'light' || resolvedTheme === 'sepia'
    ? 'text-zinc-300'
    : 'text-zinc-700'
  const activeColor = resolvedTheme === 'light' || resolvedTheme === 'sepia'
    ? 'active:bg-zinc-100'
    : 'active:bg-zinc-800'

  return (
    <>
      {/* Mobile Bottom Navigation Bar - only shows on small screens */}
      {/* Full-width background layer */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${theme.bg} ${theme.border} border-t safe-area-bottom`}>
        {/* Constrained width container matching reading content */}
        <div className={`container mx-auto px-4 ${widthClass}`}>
          <div className="flex items-center justify-around h-14">
            {/* Previous Chapter */}
            {prevChapterId ? (
              <Link
                href={`/story/${storyId}/chapter/${prevChapterId}`}
                className={`flex flex-col items-center justify-center flex-1 h-full ${textColor} ${activeColor} rounded-lg`}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Previous</span>
              </Link>
            ) : (
              <div className={`flex flex-col items-center justify-center flex-1 h-full ${disabledColor}`}>
                <ChevronLeft className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Previous</span>
              </div>
            )}

            {/* Chapter List / Story Page */}
            <Link
              href={`/story/${storyId}`}
              className={`flex flex-col items-center justify-center flex-1 h-full ${textColor} ${activeColor} rounded-lg`}
            >
              <List className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">{currentChapter}/{totalChapters}</span>
            </Link>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${textColor} ${activeColor} rounded-lg`}
            >
              <Settings2 className="h-5 w-5" />
              <span className="text-[10px] mt-0.5">Settings</span>
            </button>

            {/* Next Chapter */}
            {nextChapterId ? (
              <Link
                href={`/story/${storyId}/chapter/${nextChapterId}`}
                className={`flex flex-col items-center justify-center flex-1 h-full ${textColor} ${activeColor} rounded-lg`}
              >
                <ChevronRight className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Next</span>
              </Link>
            ) : (
              <div className={`flex flex-col items-center justify-center flex-1 h-full ${disabledColor}`}>
                <ChevronRight className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Next</span>
              </div>
            )}
          </div>
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
          
          {/* Settings Panel - uses reading theme */}
          <div className={`absolute bottom-0 left-0 right-0 ${theme.bg} ${theme.text} rounded-t-2xl max-h-[80vh] overflow-y-auto safe-area-bottom`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Reading Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="opacity-70 hover:opacity-100 p-2 -mr-2"
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
    </>
  )
}
