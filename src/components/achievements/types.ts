// Shared types for achievements system - NO "use client" directive
// This file can be imported by both server and client components

export type AchievementCategory = 'reader' | 'reviewer' | 'author' | 'loyalty'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  xpReward: number
  threshold: number | null
  statKey: string | null
  sortOrder: number
}

export interface UserAchievement {
  achievementId: string
  unlockedAt: string
  progress: number
  achievement: Achievement
}

export interface FeaturedBadge {
  achievementId: string
  displayOrder: number
  achievement: Pick<Achievement, 'id' | 'name' | 'description' | 'icon'>
}
