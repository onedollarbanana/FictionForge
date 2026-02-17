'use client'

import { useMemo } from 'react'
import { AchievementCard } from './achievement-card'
import type { Achievement, UserAchievement, AchievementCategory } from './types'

interface UserStats {
  commentCount: number
  reviewCount: number
  totalWords: number
  followerCount: number
  totalViews: number
  accountAgeDays: number
}

interface AchievementGridProps {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  userStats?: UserStats
  category?: AchievementCategory | 'all'
  showLocked?: boolean
  className?: string
}

// Map stat_key to userStats property
function getStatValue(statKey: string | null, stats?: UserStats): number | undefined {
  if (!stats || !statKey) return undefined
  
  const mapping: Record<string, keyof UserStats> = {
    comment_count: 'commentCount',
    review_count: 'reviewCount',
    total_words: 'totalWords',
    follower_count: 'followerCount',
    total_views: 'totalViews',
    account_age_days: 'accountAgeDays',
  }
  
  const key = mapping[statKey]
  return key ? stats[key] : undefined
}

export function AchievementGrid({
  achievements,
  userAchievements,
  userStats,
  category = 'all',
  showLocked = true,
  className,
}: AchievementGridProps) {
  // Create a map of unlocked achievements for quick lookup
  const unlockedMap = useMemo(() => {
    const map = new Map<string, UserAchievement>()
    userAchievements.forEach(ua => map.set(ua.achievementId, ua))
    return map
  }, [userAchievements])

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = achievements

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(a => a.category === category)
    }

    // Optionally hide locked achievements
    if (!showLocked) {
      filtered = filtered.filter(a => unlockedMap.has(a.id))
    }

    // Sort: unlocked first, then by sort_order
    return filtered.sort((a, b) => {
      const aUnlocked = unlockedMap.has(a.id) ? 0 : 1
      const bUnlocked = unlockedMap.has(b.id) ? 0 : 1
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked
      return a.sortOrder - b.sortOrder
    })
  }, [achievements, category, showLocked, unlockedMap])

  if (filteredAchievements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No achievements to display
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            userAchievement={unlockedMap.get(achievement.id)}
            currentProgress={getStatValue(achievement.statKey, userStats)}
          />
        ))}
      </div>
    </div>
  )
}
