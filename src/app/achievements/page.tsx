import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, BookOpen, Star, Pen, Heart } from 'lucide-react'
import { AchievementGrid } from '@/components/achievements'
import type { Achievement, UserAchievement, AchievementCategory } from '@/components/achievements/types'
import { BadgeSelectorClient } from './badge-selector-client'

export const metadata: Metadata = {
  title: 'Achievements | FictionForge',
  description: 'View your achievements and select badges to display on your profile'
}

const categoryIcons: Record<AchievementCategory, typeof Trophy> = {
  reader: BookOpen,
  reviewer: Star,
  author: Pen,
  loyalty: Heart,
}

const categoryLabels: Record<AchievementCategory, string> = {
  reader: 'Reader',
  reviewer: 'Reviewer',
  author: 'Author',
  loyalty: 'Loyalty',
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get all achievements
  const { data: allAchievementsResult } = await supabase.rpc('get_all_achievements')
  const allAchievements: Achievement[] = (allAchievementsResult as Achievement[]) || []

  // Get user's unlocked achievements
  const { data: userAchievementsResult } = await supabase
    .rpc('get_user_achievements', { target_user_id: user.id })
  const userAchievements: UserAchievement[] = (userAchievementsResult as UserAchievement[]) || []

  // Get user's featured badges
  const { data: featuredBadgesResult } = await supabase
    .rpc('get_featured_badges', { target_user_id: user.id })
  const featuredBadges = (featuredBadgesResult as { achievementId: string }[]) || []
  const featuredBadgeIds = featuredBadges.map(fb => fb.achievementId)

  // Get user stats for progress tracking
  const { data: userStatsResult } = await supabase
    .rpc('get_user_stats', { target_user_id: user.id })
  const userStats = userStatsResult as {
    commentCount: number
    reviewCount: number
    totalWords: number
    followerCount: number
    totalViews: number
    accountAgeDays: number
  } | null

  // Calculate stats per category
  const categories: AchievementCategory[] = ['reader', 'reviewer', 'author', 'loyalty']
  const categoryStats = categories.map(cat => {
    const total = allAchievements.filter(a => a.category === cat).length
    const unlocked = userAchievements.filter(ua => 
      allAchievements.find(a => a.id === ua.achievementId)?.category === cat
    ).length
    return {
      category: cat,
      total,
      unlocked,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
    }
  })

  const totalUnlocked = userAchievements.length
  const totalAchievements = allAchievements.length
  const overallPercentage = totalAchievements > 0 
    ? Math.round((totalUnlocked / totalAchievements) * 100) 
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and unlock achievements by participating in the community
          </p>
        </div>

        {/* Overall Progress Card */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {totalUnlocked} / {totalAchievements} Achievements
                </h2>
                <p className="text-muted-foreground">
                  {overallPercentage}% complete
                </p>
              </div>
              <div className="w-full md:w-64">
                <Progress value={overallPercentage} className="h-3" />
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {categoryStats.map(({ category, total, unlocked, percentage }) => {
                const Icon = categoryIcons[category]
                return (
                  <div key={category} className="text-center">
                    <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-semibold">{categoryLabels[category]}</p>
                    <p className="text-sm text-muted-foreground">
                      {unlocked}/{total} ({percentage}%)
                    </p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Featured Badges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Featured Badges</span>
              <BadgeSelectorClient 
                userAchievements={userAchievements}
                featuredBadgeIds={featuredBadgeIds}
              />
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select up to 5 achievements to display on your profile
            </p>
          </CardHeader>
        </Card>

        {/* Achievement Tabs by Category */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1">
            <TabsTrigger value="all">
              All ({totalUnlocked}/{totalAchievements})
            </TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {categoryLabels[cat]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <AchievementGrid
              achievements={allAchievements}
              userAchievements={userAchievements}
              userStats={userStats || undefined}
              showLocked={true}
            />
          </TabsContent>

          {categories.map(cat => (
            <TabsContent key={cat} value={cat}>
              <AchievementGrid
                achievements={allAchievements}
                userAchievements={userAchievements}
                userStats={userStats || undefined}
                category={cat}
                showLocked={true}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
