'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { 
  Sprout, 
  BookOpen, 
  Pen, 
  Shield, 
  Crown 
} from 'lucide-react'

export type ExperienceTier = 'newcomer' | 'reader' | 'contributor' | 'veteran' | 'champion'

interface ExperienceBadgeProps {
  tier: ExperienceTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const tierConfig: Record<ExperienceTier, {
  label: string
  icon: typeof Sprout
  color: string
  bgColor: string
}> = {
  newcomer: {
    label: 'Newcomer',
    icon: Sprout,
    color: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800'
  },
  reader: {
    label: 'Reader',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  contributor: {
    label: 'Contributor',
    icon: Pen,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  veteran: {
    label: 'Veteran',
    icon: Shield,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30'
  },
  champion: {
    label: 'Champion',
    icon: Crown,
    color: 'text-yellow-500 dark:text-yellow-400',
    bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30'
  }
}

const sizeConfig = {
  sm: {
    badge: 'px-1.5 py-0.5 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1'
  },
  md: {
    badge: 'px-2 py-1 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-1.5'
  },
  lg: {
    badge: 'px-3 py-1.5 text-base',
    icon: 'h-5 w-5',
    gap: 'gap-2'
  }
}

export function ExperienceBadge({ 
  tier, 
  size = 'md', 
  showLabel = true,
  className 
}: ExperienceBadgeProps) {
  const config = tierConfig[tier]
  const sizes = sizeConfig[size]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border-0',
        config.bgColor,
        config.color,
        sizes.badge,
        sizes.gap,
        'inline-flex items-center',
        className
      )}
    >
      <Icon className={sizes.icon} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  )
}

export { tierConfig }
