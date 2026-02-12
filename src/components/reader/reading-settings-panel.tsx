'use client'

import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReadingSettings } from '@/lib/hooks/useReadingSettings'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'

interface ReadingSettingsPanelProps {
  settings: ReadingSettings
  onUpdateSettings: (updates: Partial<ReadingSettings>) => void
  onResetSettings: () => void
  isMobileSheet?: boolean
}

export function ReadingSettingsPanel({
  settings,
  onUpdateSettings,
  onResetSettings,
  isMobileSheet = false,
}: ReadingSettingsPanelProps) {
  const fontOptions = [
    { value: 'default', label: 'Default' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans', label: 'Sans' },
    { value: 'mono', label: 'Mono' },
  ] as const

  const lineHeightOptions = [
    { value: 'tight', label: 'Tight' },
    { value: 'normal', label: 'Normal' },
    { value: 'relaxed', label: 'Relaxed' },
  ] as const

  const themeOptions = [
    { value: 'auto', label: 'Auto', preview: 'bg-gradient-to-r from-white to-zinc-900' },
    { value: 'light', label: 'Light', preview: 'bg-white border-zinc-300' },
    { value: 'dark', label: 'Dark', preview: 'bg-zinc-900 border-zinc-700' },
    { value: 'sepia', label: 'Sepia', preview: 'bg-amber-50 border-amber-300' },
    { value: 'night', label: 'Night', preview: 'bg-black border-zinc-700' },
  ] as const

  const widthOptions = [
    { value: 'narrow', label: 'Narrow' },
    { value: 'medium', label: 'Medium' },
    { value: 'wide', label: 'Wide' },
  ] as const

  const SettingsContent = () => (
    <div className="space-y-6">
      {/* Font Family */}
      <div>
        <label className="text-sm font-medium mb-2 block">Font</label>
        <div className="flex gap-2">
          {fontOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdateSettings({ fontFamily: option.value })}
              className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors
                ${settings.fontFamily === option.value 
                  ? 'border-primary bg-primary/10 font-medium' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Size: {settings.fontSize}px
        </label>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([value]) => onUpdateSettings({ fontSize: value })}
          min={14}
          max={24}
          step={1}
          className="w-full"
        />
      </div>

      {/* Line Height */}
      <div>
        <label className="text-sm font-medium mb-2 block">Line Spacing</label>
        <div className="flex gap-2">
          {lineHeightOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdateSettings({ lineHeight: option.value })}
              className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors
                ${settings.lineHeight === option.value 
                  ? 'border-primary bg-primary/10 font-medium' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="text-sm font-medium mb-2 block">Theme</label>
        <div className="flex gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdateSettings({ theme: option.value })}
              className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-md border transition-colors
                ${settings.theme === option.value 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              <div className={`w-6 h-6 rounded-full border ${option.preview}`} />
              <span className="text-xs">{option.label}</span>
            </button>
          ))}  
        </div>
      </div>

      {/* Width */}
      <div>
        <label className="text-sm font-medium mb-2 block">Content Width</label>
        <div className="flex gap-2">
          {widthOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onUpdateSettings({ width: option.value })}
              className={`flex-1 px-3 py-2 rounded-md text-sm border transition-colors
                ${settings.width === option.value 
                  ? 'border-primary bg-primary/10 font-medium' 
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        onClick={onResetSettings}
        className="w-full"
      >
        Reset to Defaults
      </Button>
    </div>
  )

  // If embedded in mobile sheet, just render content
  if (isMobileSheet) {
    return <SettingsContent />
  }

  // Desktop: Slide-out sheet
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Reading settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Reading Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SettingsContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}
