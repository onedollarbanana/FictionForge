// Shared types for experience system - NO "use client" directive
// This file can be imported by both server and client components

export type ExperienceTier = 
  | 'newcomer' 
  | 'regular'
  | 'established' 
  | 'veteran' 
  | 'elite'
  | 'legend'
  | 'mythic'
  | 'transcendent'
  | 'celestial'
  | 'immortal'
  | 'godlike'
  | 'omniscient'

export interface ExperienceData {
  xpScore: number
  tier: ExperienceTier
  totalEarned: number
  totalLost: number
  tierMinScore: number
  tierMaxScore: number
  progressInTier: number
  currentStreak: number
  longestStreak: number
}
