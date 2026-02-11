'use client'

import { Settings, Type, AlignLeft, Sun, Moon, Columns, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { ReadingSettings } from '@/lib/hooks/useReadingSettings'

interface ReadingSettingsPanelProps {
  settings: ReadingSettings
  onUpdateSettings: (updates: Partial<ReadingSettings>) => void
  onResetSettings: () => void
}

const fontOptions: { value: ReadingSettings['fontFamily']; label: string; preview: string }[] = [
  { value: 'default', label: 'Default', preview: 'Aa' },
  { value: 'serif', label: 'Serif', preview: 'Aa' },
  { value: 'sans', label: 'Sans', preview: 'Aa' },
  { value: 'mono', label: 'Mono', preview: 'Aa' },
]

const lineHeightOptions: { value: ReadingSettings['lineHeight']; label: string }[] = [
  { value: 'tight', label: 'Tight' },
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
]

const themeOptions: { value: ReadingSettings['theme']; label: string; icon: React.ReactNode; colors: string }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" />, colors: 'bg-white border-zinc-200 text-zinc-900' },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" />, colors: 'bg-zinc-900 border-zinc-700 text-zinc-100' },
  { value: 'sepia', label: 'Sepia', icon: <Type className="h-4 w-4" />, colors: 'bg-amber-50 border-amber-200 text-amber-900' },
  { value: 'night', label: 'Night', icon: <Moon className="h-4 w-4" />, colors: 'bg-black border-zinc-800 text-zinc-300' },
]

const widthOptions: { value: ReadingSettings['width']; label: string }[] = [
  { value: 'narrow', label: 'Narrow' },
  { value: 'medium', label: 'Medium' },
  { value: 'wide', label: 'Wide' },
]

export function ReadingSettingsPanel({ settings, onUpdateSettings, onResetSettings }: ReadingSettingsPanelProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Reading Settings">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Reading Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Reading Settings
          </SheetTitle>
          <SheetDescription>
            Customize your reading experience
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Font Family */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Font Family
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {fontOptions.map((font) => (
                <button
                  key={font.value}
                  onClick={() => onUpdateSettings({ fontFamily: font.value })}
                  className={`
                    p-2 rounded-lg border-2 transition-all text-center
                    ${settings.fontFamily === font.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted hover:border-primary/50'}
                    ${font.value === 'serif' ? 'font-serif' : ''}
                    ${font.value === 'mono' ? 'font-mono' : ''}
                  `}
                >
                  <span className="text-lg font-medium">{font.preview}</span>
                  <span className="block text-[10px] text-muted-foreground mt-1">{font.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{settings.fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs">A</span>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => onUpdateSettings({ fontSize: value })}
                min={14}
                max={24}
                step={1}
                className="flex-1"
              />
              <span className="text-lg font-bold">A</span>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <AlignLeft className="h-4 w-4" />
              Line Spacing
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {lineHeightOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdateSettings({ lineHeight: option.value })}
                  className={`
                    py-2 px-3 rounded-lg border-2 transition-all text-sm
                    ${settings.lineHeight === option.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted hover:border-primary/50'}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Theme */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Reading Theme
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => onUpdateSettings({ theme: theme.value })}
                  className={`
                    p-3 rounded-lg border-2 transition-all flex items-center gap-2
                    ${settings.theme === theme.value 
                      ? 'border-primary ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'}
                    ${theme.colors}
                  `}
                >
                  {theme.icon}
                  <span className="text-sm font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Width */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              Content Width
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {widthOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdateSettings({ width: option.value })}
                  className={`
                    py-2 px-3 rounded-lg border-2 transition-all text-sm
                    ${settings.width === option.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted hover:border-primary/50'}
                  `}
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
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
