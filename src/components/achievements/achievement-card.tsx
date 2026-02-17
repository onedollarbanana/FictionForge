'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, Lock } from 'lucide-react'
import type { Achievement, UserAchievement } from './types'

interface AchievementCardProps {
  achievement: Achievement
  userAchievement?: UserAchievement
  currentProgress?: number // Current stat value for progress tracking
  className?: string
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  reader: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  reviewer: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  author: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  loyalty: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
}

export function AchievementCard({
  achievement,
  userAchievement,
  currentProgress,
  className,
}: AchievementCardProps) {
  const isUnlocked = !!userAchievement
  const colors = categoryColors[achievement.category] || categoryColors.reader
  
  // Calculate progress percentage
  const progressPercent = achievement.threshold && currentProgress !== undefined
    ? Math.min(100, Math.round((currentProgress / achievement.threshold) * 100))
    : isUnlocked ? 100 : 0

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all',
        isUnlocked 
          ? 'border-green-200 dark:border-green-800' 
          : 'border-muted opacity-75',
        className
      )}
    >
      {/* Unlocked indicator */}
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <div className="bg-green-500 text-white rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Icon */}
          <div 
            className={cn(
              'text-3xl h-12 w-12 flex items-center justify-center rounded-lg',
              isUnlocked ? colors.bg : 'bg-muted',
              !isUnlocked && 'grayscale'
            )}
          >
            {isUnlocked ? achievement.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                'font-semibold text-sm truncate',
                !isUnlocked && 'text-muted-foreground'
              )}>
                {achievement.name}
              </h3>
              <Badge 
                variant="secondary" 
                className={cn('text-xs shrink-0', colors.bg, colors.text)}
              >
                {achievement.category}
              </Badge>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {achievement.description}
            </p>
            
            {/* Progress bar for locked achievements */}
            {!isUnlocked && achievement.threshold && currentProgress !== undefined && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{currentProgress.toLocaleString()} / {achievement.threshold.toLocaleString()}</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            )}
            
            {/* XP reward */}
            <div className="flex items-center gap-2 mt-2">
              <span className={cn(
                'text-xs font-medium',
                isUnlocked ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
              )}>
                +{achievement.xpReward} XP
              </span>
              {isUnlocked && userAchievement && (
                <span className="text-xs text-muted-foreground">
                  • Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
