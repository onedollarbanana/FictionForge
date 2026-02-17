'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ExperienceBadge, tierConfig } from './experience-badge'
import { ExperienceTier, ExperienceData } from './types'
import { TrendingUp, Sparkles } from 'lucide-react'

interface ExperienceCardProps {
  experience: ExperienceData | null
  showDetails?: boolean
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

export function ExperienceCard({ experience, showDetails = true }: ExperienceCardProps) {
  if (!experience) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Start participating to earn XP!</p>
        </CardContent>
      </Card>
    )
  }

  const { xpScore, tier, progressInTier } = experience
  const config = tierConfig[tier]
  const nextTier = nextTierMap[tier]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExperienceBadge tier={tier} size="lg" />
            <div>
              <p className="font-semibold capitalize">{tier}</p>
              <p className="text-sm text-muted-foreground">{xpScore.toLocaleString()} XP</p>
            </div>
          </div>
          {nextTier && (
            <div className="text-right text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 inline mr-1" />
              Next: {nextTier.tier}
            </div>
          )}
        </div>

        {showDetails && nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to {nextTier.tier}</span>
              <span>{Math.round(progressInTier)}%</span>
            </div>
            <Progress value={progressInTier} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {(nextTier.minScore - xpScore).toLocaleString()} XP to go
            </p>
          </div>
        )}

        {showDetails && (
          <p className="text-xs text-muted-foreground">
            {config.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
