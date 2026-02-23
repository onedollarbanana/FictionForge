'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ReadingSettings {
  fontFamily: 'default' | 'merriweather' | 'lora' | 'source-sans' | 'mono' | 'merriweather' | 'lora' | 'literata' | 'source-sans'
  fontSize: number // 14-24
  lineHeight: 'compact' | 'normal' | 'relaxed' | 'spacious'
  theme: 'auto' | 'light' | 'dark' | 'sepia' | 'night'
  width: 'narrow' | 'medium' | 'wide'
  brightness: number // 50-150, default 100
  readingMode: 'paged' | 'continuous'
}

const DEFAULT_SETTINGS: ReadingSettings = {
  fontFamily: 'default',
  fontSize: 18,
  lineHeight: 'normal',
  theme: 'auto', // Follows site dark/light mode
  width: 'medium',
  brightness: 100,
  readingMode: 'paged',
}

const STORAGE_KEY = 'fictionry-reading-settings'

export function useReadingSettings() {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ReadingSettings>
        // Migrate old 'light' default to 'auto' if user never explicitly changed theme
        // This handles users who had old settings before 'auto' existed
        const migratedSettings = { ...DEFAULT_SETTINGS, ...parsed }
        setSettings(migratedSettings)
      }
    } catch (e) {
      console.error('Failed to load reading settings:', e)
    }
    setIsLoaded(true)
  }, [])

  // Sync settings across all hook instances on the same page
  useEffect(() => {
    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent<ReadingSettings>).detail
      if (detail) setSettings(detail)
    }
    window.addEventListener('fictionry-settings-sync', handleSync)
    return () => window.removeEventListener('fictionry-settings-sync', handleSync)
  }, [])

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (e) {
        console.error('Failed to save reading settings:', e)
      }
    }
  }, [settings, isLoaded])

  const updateSettings = useCallback((updates: Partial<ReadingSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates }
      window.dispatchEvent(new CustomEvent('fictionry-settings-sync', { detail: newSettings }))
      return newSettings
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    // Also clear localStorage to ensure fresh start
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear reading settings:', e)
    }
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  }
}

// CSS classes for each setting
export const fontFamilyClasses: Record<ReadingSettings['fontFamily'], string> = {
  default: 'font-sans',
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',
  merriweather: 'font-merriweather',
  lora: 'font-lora',
  literata: 'font-literata',
  'source-sans': 'font-source-sans',
}

export const lineHeightClasses: Record<ReadingSettings['lineHeight'], string> = {
  compact: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  spacious: 'leading-loose',
}

export const widthClasses: Record<ReadingSettings['width'], string> = {
  narrow: 'max-w-xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
}
