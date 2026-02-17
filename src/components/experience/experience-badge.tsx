'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { 
  Sprout, 
  BookOpen, 
  Pen, 
  Shield, 
  Crown,
  Star,
  Gem,
  Flame,
  Sparkles
} from 'lucide-react'
import type { ExperienceTier } from './types'

interface ExperienceBadgeProps {
  tier: ExperienceTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const tierConfig: Record<ExperienceTier, {
  label: string
  icon: typeof Sprout
  color: string
  bgColor: string
  description: string
}> = {
  newcomer: {
    label: 'Newcomer',
    icon: Sprout,
    color: 'text-zinc-600 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
    description: 'Welcome to FictionForge! Start reading and engaging to level up.'
  },
  reader: {
    label: 'Reader',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'An active reader who enjoys exploring stories.'
  },
  regular: {
    label: 'Regular',
    icon: Star,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    description: 'A consistent member of the community.'
  },
  contributor: {
    label: 'Contributor',
    icon: Pen,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Actively contributes reviews and comments.'
  },
  veteran: {
    label: 'Veteran',
    icon: Shield,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'A seasoned member with valuable experience.'
  },
  master: {
    label: 'Master',
    icon: Crown,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'A highly experienced and respected member.'
  },
  legend: {
    label: 'Legend',
    icon: Flame,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'A legendary contributor to the community.'
  },
  elite: {
    label: 'Elite',
    icon: Gem,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    description: 'Among the most dedicated members.'
  },
  mythic: {
    label: 'Mythic',
    icon: Sparkles,
    color: 'text-yellow-500 dark:text-yellow-400',
    bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
    description: 'The pinnacle of community achievement.'
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
  const config = tierConfig[tier] || tierConfig.newcomer
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
