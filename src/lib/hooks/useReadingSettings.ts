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
  theme: 'auto', // Now defaults to following site theme
  width: 'medium',
}

const STORAGE_KEY = 'fictionforge-reading-settings'

export function useReadingSettings() {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'sepia' | 'night'>('light')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ReadingSettings>
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (e) {
      console.error('Failed to load reading settings:', e)
    }
    setIsLoaded(true)
  }, [])

  // Resolve 'auto' theme based on site dark mode
  useEffect(() => {
    if (settings.theme === 'auto') {
      // Check if site is in dark mode (next-themes adds 'dark' class to <html>)
      const checkDarkMode = () => {
        const isDark = document.documentElement.classList.contains('dark')
        setResolvedTheme(isDark ? 'dark' : 'light')
      }
      
      checkDarkMode()
      
      // Watch for class changes on <html> (next-themes toggles)
      const observer = new MutationObserver(checkDarkMode)
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      })
      
      return () => observer.disconnect()
    } else {
      setResolvedTheme(settings.theme)
    }
  }, [settings.theme])

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
  }, [])

  return {
    settings,
    resolvedTheme, // The actual theme to use (never 'auto')
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

// Theme styles (applied to container)
export const themeStyles: Record<'light' | 'dark' | 'sepia' | 'night', { bg: string; text: string; border: string }> = {
  light: { bg: 'bg-white', text: 'text-zinc-900', border: 'border-zinc-200' },
  dark: { bg: 'bg-zinc-900', text: 'text-zinc-100', border: 'border-zinc-700' },
  sepia: { bg: 'bg-amber-50', text: 'text-amber-950', border: 'border-amber-200' },
  night: { bg: 'bg-black', text: 'text-zinc-300', border: 'border-zinc-800' },
}
