'use client'

import Link from 'next/link'
import { HelpCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HelpLinkProps {
  href: string
  label?: string
  className?: string
}

/**
 * Contextual help icon that links to a relevant guide page.
 * Renders a subtle ? icon with tooltip. Opens guide in new tab.
 */
export function HelpLink({ href, label = 'Help', className = '' }: HelpLinkProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors ${className}`}
            aria-label={label}
          >
            <HelpCircle className="h-4 w-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
