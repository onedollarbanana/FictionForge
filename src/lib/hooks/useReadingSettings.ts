'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ReadingSettings {
  fontFamily: 'default' | 'serif' | 'sans' | 'mono'
  fontSize: number // 14-24
  lineHeight: 'tight' | 'normal' | 'relaxed'
  theme: 'auto' | 'light' | 'dark' | 'sepia' | 'night'
  width: 'narrow' | 'medium' | 'wide'
}

const DEFAULT_SETTINGS: ReadingSettings = {
  fontFamily: 'default',
  fontSize: 18,
  lineHeight: 'normal',
  theme: 'auto', // Follows site dark/light mode
  width: 'medium',
}

const STORAGE_KEY = 'fictionforge-reading-settings'

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
    setSettings(prev => ({ ...prev, ...updates }))
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
}

export const lineHeightClasses: Record<ReadingSettings['lineHeight'], string> = {
  tight: 'leading-snug',
  normal: 'leading-relaxed',
  relaxed: 'leading-loose',
}

export const widthClasses: Record<ReadingSettings['width'], string> = {
  narrow: 'max-w-xl',
  medium: 'max-w-3xl',
  wide: 'max-w-5xl',
}
