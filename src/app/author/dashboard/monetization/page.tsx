'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useUser } from '@/lib/hooks/useUser'
import { PLATFORM_CONFIG, type TierName } from '@/lib/platform-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  CreditCard,
  Check,
  AlertCircle,
  ExternalLink,
  Lock,
  Unlock,
  ArrowLeft,
  Loader2,
  Save,
  TrendingUp,
  Users,
  Wallet,
  Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HelpLink } from '@/components/ui/help-link'

// --- Types ---

interface AccountStatus {
  hasAccount: boolean
  stripeAccountId?: string
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
  detailsSubmitted?: boolean
  onboardingComplete?: boolean
}

interface TierConfig {
  tier_name: TierName
  enabled: boolean
  description: string | null
  price_cents: number
  display_name: string
}

const DEFAULT_DESCRIPTIONS: Record<TierName, string> = {
  supporter: 'Get early access to upcoming chapters before anyone else.',
  enthusiast: 'Stay ahead with more advance chapters and support the story.',
  patron: 'Maximum early access and help shape the story\'s future.',
}

// --- Component ---

export default function MonetizationPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Stripe Connect state
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [connectLoading, setConnectLoading] = useState(true)
  const [connectActionLoading, setConnectActionLoading] = useState(false)

  // Onboarding state
  const [onboardingSuccess, setOnboardingSuccess] = useState(false)

  // Tiers state
  const [tiers, setTiers] = useState<TierConfig[]>([])
  const [tiersLoading, setTiersLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Earnings state
  const [earnings, setEarnings] = useState<{
    availableBalance: number
    totalEarned: number
    activeSubscribers: number
    pendingPayout: number
  } | null>(null)
  const [earningsLoading, setEarningsLoading] = useState(true)
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutMessage, setPayoutMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const isConnected = accountStatus?.hasAccount && accountStatus?.onboardingComplete && accountStatus?.chargesEnabled

  // --- Data Fetching ---

  const fetchAccountStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/connect/account-status')
      if (!res.ok) throw new Error('Failed to fetch account status')
      const data = await res.json()
      // Map snake_case API response to camelCase interface
      setAccountStatus({
        hasAccount: data.has_account ?? data.hasAccount ?? false,
        stripeAccountId: data.stripe_account_id ?? data.stripeAccountId,
        chargesEnabled: data.charges_enabled ?? data.chargesEnabled ?? false,
        payoutsEnabled: data.payouts_enabled ?? data.payoutsEnabled ?? false,
        detailsSubmitted: data.details_submitted ?? data.detailsSubmitted ?? false,
        onboardingComplete: data.onboarding_complete ?? data.onboardingComplete ?? false,
      })
    } catch {
      setAccountStatus({ hasAccount: false })
    } finally {
      setConnectLoading(false)
    }
  }, [])

  const fetchTiers = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/author-tiers')
      if (!res.ok) throw new Error('Failed to fetch tiers')
      const data = await res.json()
      setTiers(data.tiers)
    } catch {
      // Set defaults if fetch fails
      setTiers(
        (Object.keys(PLATFORM_CONFIG.TIER_PRICES) as TierName[]).map((name) => ({
          tier_name: name,
          enabled: false,
          description: null,
          price_cents: PLATFORM_CONFIG.TIER_PRICES[name],
          display_name: PLATFORM_CONFIG.TIER_NAMES[name],
        }))
      )
    } finally {
      setTiersLoading(false)
    }
  }, [])

  const fetchEarnings = useCallback(async () => {
    if (!user) return
    setEarningsLoading(true)
    try {
      const supabase = createClient()

      const [revenueRes, pendingPayoutRes, activeSubsRes] = await Promise.all([
        supabase
          .from('author_revenue')
          .select('net_amount_cents')
          .eq('author_id', user.id),
        supabase
          .from('payouts')
          .select('amount_cents')
          .eq('author_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('author_subscriptions')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', user.id)
          .eq('status', 'active'),
      ])

      const totalEarned = (revenueRes.data ?? []).reduce(
        (s, r) => s + (r.net_amount_cents ?? 0), 0
      )
      const pendingPayout = (pendingPayoutRes.data ?? []).reduce(
        (s, r) => s + (r.amount_cents ?? 0), 0
      )
      // Available = total earned minus pending payout requests (paid payouts were
      // already deducted when net_amount_cents was recorded as negative author_revenue)
      const availableBalance = totalEarned - pendingPayout
      const activeSubscribers = activeSubsRes.count ?? 0

      setEarnings({ availableBalance, totalEarned, activeSubscribers, pendingPayout })
    } catch {
      // Non-critical — earnings section just won't show
    } finally {
      setEarningsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      fetchAccountStatus()
      fetchTiers()
      fetchEarnings()

      // Handle onboarding return
      if (searchParams.get('onboarding') === 'complete') {
        setOnboardingSuccess(true)
        // Clean URL without reload
        window.history.replaceState({}, '', '/author/dashboard/monetization')
      }
    }
  }, [user, userLoading, router, searchParams, fetchAccountStatus, fetchTiers, fetchEarnings])

  // --- Handlers ---

  async function handleConnectStripe() {
    setConnectActionLoading(true)
    try {
      const res = await fetch('/api/stripe/connect/create-account', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create Stripe account')
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to start Stripe onboarding. Please try again.' })
    } finally {
      setConnectActionLoading(false)
    }
  }

  async function handleStripeDashboard() {
    setConnectActionLoading(true)
    try {
      const res = await fetch('/api/stripe/connect/create-login-link', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create login link')
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to open Stripe dashboard.' })
    } finally {
      setConnectActionLoading(false)
    }
  }

  function updateTier(tierName: TierName, updates: Partial<TierConfig>) {
    setTiers((prev) =>
      prev.map((t) => (t.tier_name === tierName ? { ...t, ...updates } : t))
    )
  }

  async function handleSaveTiers() {
    setSaving(true)
    setSaveMessage(null)
    try {
      const payload = {
        tiers: tiers.map((t) => ({
          tier_name: t.tier_name,
          enabled: t.enabled,
          description: t.description || null,
        })),
      }
      const res = await fetch('/api/stripe/author-tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to save tiers')
      setSaveMessage({ type: 'success', text: 'Tier settings saved successfully!' })
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save tier settings. Please try again.' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 4000)
    }
  }

  async function handleRequestPayout() {
    setPayoutLoading(true)
    setPayoutMessage(null)
    try {
      const res = await fetch('/api/stripe/request-payout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setPayoutMessage({ type: 'error', text: data.error || 'Failed to request payout.' })
      } else {
        setPayoutMessage({ type: 'success', text: 'Payout request submitted! An admin will process it shortly.' })
        // Refresh earnings to reflect pending payout
        await fetchEarnings()
      }
    } catch {
      setPayoutMessage({ type: 'error', text: 'Failed to request payout. Please try again.' })
    } finally {
      setPayoutLoading(false)
      setTimeout(() => setPayoutMessage(null), 6000)
    }
  }

  // --- Loading State ---

  if (userLoading || connectLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-64" />
          <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  // --- Helpers ---

  function formatDollars(cents: number) {
    return `$${(cents / 100).toFixed(2)}`
  }

  function authorEarnings(cents: number) {
    return formatDollars(cents * (1 - PLATFORM_CONFIG.PLATFORM_FEE_PERCENT / 100))
  }

  // --- Render ---

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/author/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">Monetization <HelpLink href="/guides/authors/monetization" label="Monetization guide" /></h1>
            <p className="text-zinc-500 mt-1">Set up payments and configure subscription tiers</p>
          </div>
        </div>
      </div>

      {/* Save Message Toast */}
      {saveMessage && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
            saveMessage.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {saveMessage.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {saveMessage.text}
        </div>
      )}

      {onboardingSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-400">
              Stripe Connect setup complete! 🎉
            </p>
            <p className="text-xs text-green-400/70 mt-0.5">
              Your account is being verified. You can start setting up your subscription tiers below.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Stripe Connect Setup */}
      <Card className="rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <CreditCard className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Payment Setup</CardTitle>
              <CardDescription>Connect your Stripe account to receive subscriber payments</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!accountStatus?.hasAccount && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Connect your Stripe account to receive payments
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    You&apos;ll be redirected to Stripe to set up your account. This only takes a few minutes.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConnectStripe}
                disabled={connectActionLoading}
                className="gap-2 shrink-0"
              >
                {connectActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Connect with Stripe
              </Button>
            </div>
          )}

          {accountStatus?.hasAccount && !accountStatus?.onboardingComplete && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Complete your Stripe setup
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Your Stripe account needs additional information before you can receive payments.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConnectStripe}
                disabled={connectActionLoading}
                variant="outline"
                className="gap-2 shrink-0 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/30"
              >
                {connectActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Resume Setup
              </Button>
            </div>
          )}

          {isConnected && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-green-500">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    Payments enabled
                  </p>
                  <p className="text-sm text-zinc-500 mt-1">
                    Your Stripe account is connected and ready to receive payments.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleStripeDashboard}
                disabled={connectActionLoading}
                variant="outline"
                className="gap-2 shrink-0"
              >
                {connectActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
                Stripe Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Subscription Tiers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Subscription Tiers</h2>
              <p className="text-sm text-zinc-500">Configure which subscription tiers you offer to readers</p>
            </div>
          </div>
          {isConnected && (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
              <Unlock className="w-3 h-3 mr-1" />
              Editable
            </Badge>
          )}
          {!isConnected && (
            <Badge variant="secondary">
              <Lock className="w-3 h-3 mr-1" />
              Connect Stripe first
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(tiersLoading ? Array(3).fill(null) : tiers).map((tier, idx) => {
            if (!tier) {
              return (
                <div key={idx} className="h-72 animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              )
            }

            const tierName = tier.tier_name as TierName
            const price = PLATFORM_CONFIG.TIER_PRICES[tierName]

            return (
              <Card
                key={tier.tier_name}
                className={`rounded-xl transition-all ${
                  !isConnected ? 'opacity-60' : ''
                } ${
                  tier.enabled && isConnected
                    ? 'border-violet-300 dark:border-violet-700 shadow-md'
                    : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{PLATFORM_CONFIG.TIER_NAMES[tierName]}</CardTitle>
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {formatDollars(price)}
                      <span className="text-sm font-normal text-zinc-500">/mo</span>
                    </span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    You earn {authorEarnings(price)}/subscriber
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enable Toggle */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Enable tier</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={tier.enabled}
                      disabled={!isConnected}
                      onClick={() => updateTier(tierName, { enabled: !tier.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        tier.enabled
                          ? 'bg-violet-600'
                          : 'bg-zinc-300 dark:bg-zinc-600'
                      } ${!isConnected ? 'cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          tier.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>



                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Description <span className="text-zinc-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={tier.description || ''}
                      disabled={!isConnected}
                      placeholder={DEFAULT_DESCRIPTIONS[tierName]}
                      onChange={(e) => updateTier(tierName, { description: e.target.value || null })}
                      className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveTiers}
            disabled={!isConnected || saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Tier Settings
          </Button>
        </div>
      </div>

      {/* Section 3: Earnings & Payouts */}
      <Card className="rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Earnings &amp; Payouts</CardTitle>
              <CardDescription>Your current balance and earnings overview</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-4 h-4 text-green-500" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Available</p>
              </div>
              {earningsLoading ? (
                <div className="h-7 w-24 animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatDollars(Math.max(0, earnings?.availableBalance ?? 0))}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-1">Ready to request</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-zinc-400" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Total Earned</p>
              </div>
              {earningsLoading ? (
                <div className="h-7 w-24 animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatDollars(Math.max(0, earnings?.totalEarned ?? 0))}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-1">All time (net)</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-violet-500" />
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Subscribers</p>
              </div>
              {earningsLoading ? (
                <div className="h-7 w-16 animate-pulse bg-zinc-200 dark:bg-zinc-700 rounded" />
              ) : (
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {earnings?.activeSubscribers ?? 0}
                </p>
              )}
              <p className="text-xs text-zinc-400 mt-1">Active right now</p>
            </div>
          </div>

          {/* Pending payout notice */}
          {!earningsLoading && earnings && earnings.pendingPayout > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <span className="font-medium">{formatDollars(earnings.pendingPayout)}</span> payout pending — an admin will process it shortly.
              </p>
            </div>
          )}

          {/* Payout message */}
          {payoutMessage && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
              payoutMessage.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {payoutMessage.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {payoutMessage.text}
            </div>
          )}

          {/* Request payout + fee info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <div className="text-sm text-zinc-500 space-y-0.5">
              <p><span className="font-medium text-zinc-700 dark:text-zinc-300">You keep {100 - PLATFORM_CONFIG.PLATFORM_FEE_PERCENT}%</span> · Platform fee: {PLATFORM_CONFIG.PLATFORM_FEE_PERCENT}%</p>
              <p>Minimum payout: {formatDollars(PLATFORM_CONFIG.MIN_PAYOUT_CENTS)} · Paid via Stripe to your bank</p>
            </div>
            {isConnected && (
              <Button
                onClick={handleRequestPayout}
                disabled={
                  payoutLoading ||
                  earningsLoading ||
                  !earnings ||
                  earnings.availableBalance < PLATFORM_CONFIG.MIN_PAYOUT_CENTS ||
                  earnings.pendingPayout > 0
                }
                variant="outline"
                className="gap-2 shrink-0"
              >
                {payoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wallet className="w-4 h-4" />
                )}
                Request Payout
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
