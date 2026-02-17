'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface GiveRepButtonProps {
  targetType: 'comment' | 'review'
  targetId: string
  receiverUserId: string
  currentUserId: string | null
  className?: string
}

export function GiveRepButton({
  targetType,
  targetId,
  receiverUserId,
  currentUserId,
  className
}: GiveRepButtonProps) {
  const [hasGiven, setHasGiven] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successAmount, setSuccessAmount] = useState<number | null>(null)

  // Check if user has already given rep
  useEffect(() => {
    if (!currentUserId) {
      setIsChecking(false)
      return
    }

    const checkHasGiven = async () => {
      const supabase = createClient()
      // has_given_peer_rep uses original param names (target_type, target_id)
      const { data } = await supabase.rpc('has_given_peer_rep', {
        giver_user_id: currentUserId,
        target_type: targetType,
        target_id: targetId
      })
      setHasGiven(!!data)
      setIsChecking(false)
    }

    checkHasGiven()
  }, [currentUserId, targetType, targetId])

  const handleGiveRep = async () => {
    if (!currentUserId || hasGiven || isLoading) return

    // Can't give rep to yourself
    if (currentUserId === receiverUserId) {
      setError("Can't give rep to yourself")
      setTimeout(() => setError(null), 2000)
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    // give_peer_rep uses prefixed param names (p_target_type, p_target_id)
    const { data, error: rpcError } = await supabase.rpc('give_peer_rep', {
      giver_user_id: currentUserId,
      receiver_user_id: receiverUserId,
      p_target_type: targetType,
      p_target_id: targetId
    })

    setIsLoading(false)

    if (rpcError) {
      console.error('RPC Error:', rpcError)
      setError('Failed to give rep')
      setTimeout(() => setError(null), 2000)
      return
    }

    if (data && !data.success) {
      setError(data.error || 'Failed to give rep')
      setTimeout(() => setError(null), 2000)
      return
    }

    if (data?.success) {
      setHasGiven(true)
      setSuccessAmount(data.amount)
      setTimeout(() => setSuccessAmount(null), 2000)
    }
  }

  // Don't show button if not logged in or checking
  if (!currentUserId || isChecking) {
    return null
  }

  // Don't show button for own content
  if (currentUserId === receiverUserId) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs ${hasGiven ? 'text-green-600 dark:text-green-400' : ''} ${className}`}
            onClick={handleGiveRep}
            disabled={hasGiven || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <ThumbsUp className={`h-3 w-3 mr-1 ${hasGiven ? 'fill-current' : ''}`} />
            )}
            {successAmount !== null ? (
              <span className="text-green-600 dark:text-green-400">+{successAmount} Rep</span>
            ) : hasGiven ? (
              'Gave Rep'
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : (
              'Rep'
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{hasGiven ? 'You gave rep to this' : 'Give reputation point'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
