'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface LogoWordmarkProps {
  /** Rendered height in px. Width scales from the SVG aspect ratio (210:48). */
  height?: number
  /** Wrap in a Link. Pass null to render the image alone. */
  linkTo?: string | null
  className?: string
}

/**
 * Theme-aware wordmark logo (icon + "Fictionry" text).
 * Switches between logo-wordmark-dark.svg (white text) and
 * logo-wordmark-light.svg (dark text) based on the active theme.
 */
export function LogoWordmark({ height = 32, linkTo = '/', className }: LogoWordmarkProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Avoid hydration mismatch — default to dark (the site's default theme)
  const src = mounted && resolvedTheme === 'light'
    ? '/logo-wordmark-light.svg'
    : '/logo-wordmark-dark.svg'

  // SVG viewBox is 210×48 → aspect ratio 4.375
  const width = Math.round(height * (210 / 48))

  const img = (
    <Image
      src={src}
      alt="Fictionry"
      width={width}
      height={height}
      unoptimized
      priority
      className={className}
    />
  )

  if (linkTo) {
    return <Link href={linkTo}>{img}</Link>
  }

  return img
}
