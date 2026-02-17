import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ExperienceBadge, ExperienceTier, tierConfig } from './experience-badge'
import { TrendingUp, Sparkles } from 'lucide-react'

interface ExperienceData {
  xpScore: number
  tier: ExperienceTier
  totalEarned: number
  totalLost: number
  tierMinScore: number
  tierMaxScore: number
  progressInTier: number
}

interface ExperienceCardProps {
  experience: ExperienceData | null
}

// Maps current tier to next tier with its minimum score threshold
const nextTierMap: Record<ExperienceTier, { tier: ExperienceTier; minScore: number } | null> = {
  newcomer: { tier: 'reader', minScore: 100 },
  reader: { tier: 'regular', minScore: 250 },
  regular: { tier: 'contributor', minScore: 500 },
  contributor: { tier: 'veteran', minScore: 1000 },
  veteran: { tier: 'master', minScore: 2500 },
  master: { tier: 'legend', minScore: 5000 },
  legend: { tier: 'elite', minScore: 10000 },
  elite: { tier: 'mythic', minScore: 25000 },
  mythic: null
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  if (!experience) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No experience data available
          </p>
        </CardContent>
      </Card>
    )
  }

  const nextTier = nextTierMap[experience.tier]
  const pointsToNext = nextTier ? nextTier.minScore - experience.xpScore : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <ExperienceBadge tier={experience.tier} size="lg" />
          <div className="text-right">
            <p className="text-2xl font-bold">{experience.xpScore.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </div>

        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to {tierConfig[nextTier.tier].label}</span>
              <span className="font-medium">{experience.progressInTier}%</span>
            </div>
            <Progress value={experience.progressInTier} className="h-2" />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {pointsToNext.toLocaleString()} more XP to reach {tierConfig[nextTier.tier].label}
            </p>
          </div>
        )}

        {!nextTier && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              🏆 You&apos;ve reached the highest tier!
            </p>
          </div>
        )}

        <div className="pt-2 border-t flex justify-between text-sm">
          <div>
            <p className="text-muted-foreground">Earned</p>
            <p className="font-medium text-green-600 dark:text-green-400">
              +{experience.totalEarned.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Lost</p>
            <p className="font-medium text-red-600 dark:text-red-400">
              -{experience.totalLost.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
