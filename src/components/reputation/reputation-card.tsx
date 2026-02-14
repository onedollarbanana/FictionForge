import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ReputationBadge, ReputationTier, tierConfig } from './reputation-badge'
import { TrendingUp, Award } from 'lucide-react'

interface ReputationData {
  repScore: number
  tier: ReputationTier
  totalEarned: number
  totalLost: number
  tierMinScore: number
  tierMaxScore: number
  progressInTier: number
}

interface ReputationCardProps {
  reputation: ReputationData | null
}

const nextTierMap: Record<ReputationTier, { tier: ReputationTier; minScore: number } | null> = {
  newcomer: { tier: 'reader', minScore: 100 },
  reader: { tier: 'contributor', minScore: 500 },
  contributor: { tier: 'veteran', minScore: 1000 },
  veteran: { tier: 'champion', minScore: 2500 },
  champion: null
}

export function ReputationCard({ reputation }: ReputationCardProps) {
  if (!reputation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Reputation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No reputation data available
          </p>
        </CardContent>
      </Card>
    )
  }

  const nextTier = nextTierMap[reputation.tier]
  const pointsToNext = nextTier ? nextTier.minScore - reputation.repScore : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Award className="h-5 w-5" />
          Reputation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <ReputationBadge tier={reputation.tier} size="lg" />
          <div className="text-right">
            <p className="text-2xl font-bold">{reputation.repScore.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">reputation points</p>
          </div>
        </div>

        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to {tierConfig[nextTier.tier].label}</span>
              <span className="font-medium">{reputation.progressInTier}%</span>
            </div>
            <Progress value={reputation.progressInTier} className="h-2" />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {pointsToNext.toLocaleString()} more points to reach {tierConfig[nextTier.tier].label}
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
              +{reputation.totalEarned.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground">Lost</p>
            <p className="font-medium text-red-600 dark:text-red-400">
              -{reputation.totalLost.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
