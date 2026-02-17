// Achievement types - no "use client" directive since these are just types

export type AchievementCategory = 'reader' | 'reviewer' | 'author' | 'loyalty'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  statKey: string  // e.g., 'comment_count', 'review_count', 'total_words'
  threshold: number
  xpReward: number
  sortOrder: number  // Used for display ordering
}

export interface UserAchievement {
  achievementId: string
  unlockedAt: string
  achievement: Achievement
}

// For profile preview - partial achievement data
export interface AchievementPreview {
  id: string
  name: string
  icon: string
  category: AchievementCategory
}

// Featured badge from get_featured_badges function
export interface FeaturedBadge {
  achievementId: string
  displayOrder: number
  achievement: Achievement
}
