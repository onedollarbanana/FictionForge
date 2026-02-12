'use client'

import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import {
  ReadingSettings,
  fontFamilyClasses,
  lineHeightClasses,
  widthClasses,
  themeStyles,
} from '@/lib/hooks/useReadingSettings'

interface ReadingSettingsPanelProps {
  settings: ReadingSettings
  onUpdateSettings: (updates: Partial<ReadingSettings>) => void
  onResetSettings: () => void
  isMobileSheet?: boolean
}

// Settings content - reusable between desktop Sheet and mobile embedded
function SettingsContent({
  settings,
  onUpdateSettings,
  onResetSettings,
}: Omit<ReadingSettingsPanelProps, 'isMobileSheet'>) {
  return (
    <div className="space-y-6">
      {/* Font Family */}
      <div>
        <label className="text-sm font-medium mb-2 block">Font</label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(fontFamilyClasses) as Array<keyof typeof fontFamilyClasses>).map((font) => (
            <button
              key={font}
              onClick={() => onUpdateSettings({ fontFamily: font })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                settings.fontFamily === font
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              {font.charAt(0).toUpperCase() + font.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Font Size</label>
          <span className="text-sm text-zinc-500">{settings.fontSize}px</span>
        </div>
        <Slider
          value={[settings.fontSize]}
          onValueChange={([value]) => onUpdateSettings({ fontSize: value })}
          min={14}
          max={24}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between mt-1 text-xs text-zinc-500">
          <span>Small</span>
          <span>Large</span>
        </div>
      </div>

      {/* Line Spacing */}
      <div>
        <label className="text-sm font-medium mb-2 block">Line Spacing</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(lineHeightClasses) as Array<keyof typeof lineHeightClasses>).map((height) => (
            <button
              key={height}
              onClick={() => onUpdateSettings({ lineHeight: height })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                settings.lineHeight === height
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              {height.charAt(0).toUpperCase() + height.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div>
        <label className="text-sm font-medium mb-2 block">Theme</label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(themeStyles) as Array<keyof typeof themeStyles>).map((theme) => {
            const style = themeStyles[theme]
            return (
              <button
                key={theme}
                onClick={() => onUpdateSettings({ theme })}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${style.bg} ${style.text} ${
                  settings.theme === theme
                    ? 'ring-2 ring-primary ring-offset-2'
                    : ''
                }`}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content Width */}
      <div>
        <label className="text-sm font-medium mb-2 block">Content Width</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(widthClasses) as Array<keyof typeof widthClasses>).map((width) => (
            <button
              key={width}
              onClick={() => onUpdateSettings({ width })}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                settings.width === width
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              {width.charAt(0).toUpperCase() + width.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onResetSettings}
        className="w-full"
      >
        Reset to Defaults
      </Button>
    </div>
  )
}

export function ReadingSettingsPanel({
  settings,
  onUpdateSettings,
  onResetSettings,
  isMobileSheet = false,
}: ReadingSettingsPanelProps) {
  // When embedded in mobile sheet, just render the content
  if (isMobileSheet) {
    return (
      <SettingsContent
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onResetSettings={onResetSettings}
      />
    )
  }

  // Desktop: render in a Sheet/drawer
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Reading settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reading Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SettingsContent
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onResetSettings={onResetSettings}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
