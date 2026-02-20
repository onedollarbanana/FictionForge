'use client'

import { useState, useEffect, useCallback } from 'react'

// Extend Window interface for beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

const DISMISS_KEY = 'pwa-install-dismissed'
const VISIT_COUNT_KEY = 'pwa-visit-count'
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const MIN_VISITS = 3

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Animate in after showing
  useEffect(() => {
    if (showPrompt) {
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [showPrompt])

  const shouldShow = useCallback((): boolean => {
    if (typeof window === 'undefined') return false

    // Check if already dismissed within 7 days
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      if (Date.now() - dismissedTime < SEVEN_DAYS_MS) {
        return false
      }
    }

    // Check visit count
    const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10)
    return count >= MIN_VISITS
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if already running as standalone (installed)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setIsStandalone(standalone)
    if (standalone) return

    // Detect iOS
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !('MSStream' in window)
    setIsIOS(ios)

    // Increment visit count
    const currentCount = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0', 10)
    const newCount = currentCount + 1
    localStorage.setItem(VISIT_COUNT_KEY, String(newCount))

    // Listen for beforeinstallprompt (Chrome/Edge)
    const handleBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (shouldShow()) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // For iOS, show after enough visits (no native prompt event)
    if (ios && newCount >= MIN_VISITS && shouldShow()) {
      setShowPrompt(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [shouldShow])

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
          setShowPrompt(false)
        }
        setDeferredPrompt(null)
      } catch {
        // prompt() can fail if already called
      }
    } else if (isIOS) {
      setShowIOSInstructions(true)
    }
  }

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
    setIsVisible(false)
    setTimeout(() => setShowPrompt(false), 300)
  }

  // Don't render on server, if standalone, or if not showing
  if (typeof window === 'undefined' || isStandalone || !showPrompt) {
    return null
  }

  return (
    <div
      className={`fixed bottom-20 left-4 right-4 z-40 transition-all duration-300 ease-out sm:left-auto sm:right-6 sm:max-w-sm ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="rounded-2xl border border-purple-500/20 bg-white/95 p-4 shadow-2xl shadow-purple-500/10 backdrop-blur-lg dark:bg-zinc-900/95 dark:border-purple-400/20">
        {!showIOSInstructions ? (
          // Main install banner
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-2xl shadow-lg shadow-purple-500/25">
              📚
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                Install FictionForge
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Read stories offline, get notifications &amp; faster loading
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleInstall}
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-purple-700 active:bg-purple-800"
                >
                  {isIOS ? 'How to Install' : 'Install'}
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  Not now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              aria-label="Close install prompt"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          // iOS instructions
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white text-sm">
                Install on iOS
              </h3>
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Close install prompt"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ol className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  1
                </span>
                <span>
                  Tap the <strong>Share</strong> button
                  <span className="ml-1 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] dark:bg-zinc-800">
                    ⬆️
                  </span>
                  in the Safari toolbar
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  2
                </span>
                <span>
                  Scroll down and tap{' '}
                  <strong>&quot;Add to Home Screen&quot;</strong>
                  <span className="ml-1 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] dark:bg-zinc-800">
                    ➕
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  3
                </span>
                <span>
                  Tap <strong>&quot;Add&quot;</strong> to confirm — that&apos;s it! 🎉
                </span>
              </li>
            </ol>
            <button
              onClick={handleDismiss}
              className="mt-3 w-full rounded-lg bg-zinc-100 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
