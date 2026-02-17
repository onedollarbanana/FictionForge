'use client'

import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { Achievement, UserAchievement } from './types'

interface AchievementBadgeProps {
  achievement: Achievement | UserAchievement['achievement']
  unlocked?: boolean
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

const sizeConfig = {
  sm: 'text-lg h-6 w-6',
  md: 'text-2xl h-8 w-8',
  lg: 'text-3xl h-10 w-10',
}

export function AchievementBadge({
  achievement,
  unlocked = true,
  size = 'md',
  showTooltip = true,
  className,
}: AchievementBadgeProps) {
  const badge = (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        unlocked ? 'opacity-100' : 'opacity-40 grayscale',
        sizeConfig[size],
        className
      )}
      role="img"
      aria-label={achievement.name}
    >
      {achievement.icon}
    </span>
  )

  if (!showTooltip) {
    return badge
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">{achievement.description}</p>
            {!unlocked && (
              <p className="text-xs text-amber-500 mt-1">🔒 Locked</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
