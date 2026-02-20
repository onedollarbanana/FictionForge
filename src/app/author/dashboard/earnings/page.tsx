'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { PLATFORM_CONFIG } from '@/lib/platform-config'
import { Button } from '@/components/ui/button'
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 20

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

interface RevenueEntry {
  id: string
  gross_amount_cents: number
  platform_fee_cents: number
  net_amount_cents: number
  description: string
  created_at: string
}

interface PayoutEntry {
  id: string
  amount: number
  status: string
  stripe_payout_id: string | null
  period_start: string | null
  period_end: string | null
  created_at: string
}

interface TierSummary {
  tier_name: string
  count: number
  total_cents: number
}

interface StripeAccount {
  onboarding_complete: boolean
  payouts_enabled: boolean
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        styles[status] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
      }`}
    >
      {status}
    </span>
  )
}

function SkeletonCard() {
  return <div className="h-36 bg-zinc-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
}

function SkeletonTable() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-800/50 rounded" />
      ))}
    </div>
  )
}

export default function EarningsPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  // Data
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalPaidOut, setTotalPaidOut] = useState(0)
  const [tierSummaries, setTierSummaries] = useState<TierSummary[]>([])
  const [revenue, setRevenue] = useState<RevenueEntry[]>([])
  const [revenueCount, setRevenueCount] = useState(0)
  const [revenuePage, setRevenuePage] = useState(0)
  const [payouts, setPayouts] = useState<PayoutEntry[]>([])
  const [stripeAccount, setStripeAccount] = useState<StripeAccount | null>(null)

  const availableBalance = totalEarned - totalPaidOut
  const canPayout =
    availableBalance >= PLATFORM_CONFIG.MIN_PAYOUT_CENTS &&
    stripeAccount?.payouts_enabled === true
  const amountNeeded = Math.max(0, PLATFORM_CONFIG.MIN_PAYOUT_CENTS - availableBalance)

  const fetchData = useCallback(
    async (page: number) => {
      if (!user) return
      const supabase = createClient()

      // 1. Total earned
      const { data: earnedData } = await supabase
        .from('author_revenue')
        .select('net_amount_cents')
        .eq('author_id', user.id)

      const earned = earnedData?.reduce((s, r) => s + (r.net_amount_cents || 0), 0) ?? 0
      setTotalEarned(earned)

      // 2. Total paid out
      const { data: paidData } = await supabase
        .from('payouts')
        .select('amount')
        .eq('author_id', user.id)
        .eq('status', 'paid')

      const paid = paidData?.reduce((s, r) => s + (r.amount || 0), 0) ?? 0
      setTotalPaidOut(paid)

      // 3. Active subscribers grouped by tier
      const { data: subsData } = await supabase
        .from('author_subscriptions')
        .select('tier_name, amount_cents')
        .eq('author_id', user.id)
        .eq('status', 'active')

      if (subsData) {
        const grouped: Record<string, { count: number; total_cents: number }> = {}
        for (const s of subsData) {
          if (!grouped[s.tier_name]) grouped[s.tier_name] = { count: 0, total_cents: 0 }
          grouped[s.tier_name].count += 1
          grouped[s.tier_name].total_cents += s.amount_cents || 0
        }
        setTierSummaries(
          Object.entries(grouped).map(([tier_name, v]) => ({ tier_name, ...v }))
        )
      }

      // 4. Revenue history (paginated)
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data: revData, count } = await supabase
        .from('author_revenue')
        .select('*', { count: 'exact' })
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to)

      setRevenue((revData as RevenueEntry[]) || [])
      setRevenueCount(count ?? 0)

      // 5. Payouts
      const { data: payoutData } = await supabase
        .from('payouts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      setPayouts((payoutData as PayoutEntry[]) || [])

      // 6. Stripe account
      const { data: stripeData } = await supabase
        .from('author_stripe_accounts')
        .select('onboarding_complete, payouts_enabled')
        .eq('author_id', user.id)
        .maybeSingle()

      setStripeAccount(stripeData)
      setLoading(false)
    },
    [user]
  )

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
      return
    }
    if (user) fetchData(revenuePage)
  }, [user, userLoading, router, revenuePage, fetchData])

  async function requestPayout() {
    setRequesting(true)
    try {
      const res = await fetch('/api/stripe/request-payout', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Payout request failed')
      // Refresh data
      await fetchData(revenuePage)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setRequesting(false)
    }
  }

  const totalRevenuePages = Math.ceil(revenueCount / PAGE_SIZE)

  // Subscribers MRR
  const totalActiveCents = tierSummaries.reduce((s, t) => s + t.total_cents, 0)
  const mrr = Math.round(totalActiveCents * (1 - PLATFORM_CONFIG.PLATFORM_FEE_PERCENT / 100))
  const totalSubs = tierSummaries.reduce((s, t) => s + t.count, 0)

  if (userLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonTable />
        <SkeletonTable />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/author/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1 mb-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Earnings</h1>
          <p className="text-zinc-500 mt-1">Track your revenue, subscribers, and payouts</p>
        </div>
      </div>

      {/* Stripe Connect Warning */}
      {!stripeAccount && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Connect Stripe to receive payouts
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              You need a Stripe Connect account before you can withdraw earnings.
            </p>
            <Link href="/author/dashboard/monetization">
              <Button size="sm" variant="outline" className="mt-2 gap-1">
                <CreditCard className="w-4 h-4" /> Set up Stripe Connect
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Balance Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earned */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCents(totalEarned)}
            </p>
            <p className="text-sm text-zinc-500 mt-1">Total Earned</p>
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCents(totalPaidOut)}
            </p>
            <p className="text-sm text-zinc-500 mt-1">Total Paid Out</p>
          </div>
        </div>

        {/* Available Balance */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCents(availableBalance)}
            </p>
            <p className="text-sm text-zinc-500 mt-1">Available Balance</p>
          </div>
        </div>

        {/* Payout Action */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="p-3 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 w-fit">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="mt-4">
            {canPayout ? (
              <Button
                onClick={requestPayout}
                disabled={requesting}
                className="w-full gap-2"
              >
                <DollarSign className="w-4 h-4" />
                {requesting ? 'Requesting…' : 'Request Payout'}
              </Button>
            ) : availableBalance < PLATFORM_CONFIG.MIN_PAYOUT_CENTS ? (
              <p className="text-sm text-zinc-500">
                You need{' '}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatCents(amountNeeded)}
                </span>{' '}
                more to reach the {formatCents(PLATFORM_CONFIG.MIN_PAYOUT_CENTS)} minimum payout
                threshold.
              </p>
            ) : (
              <p className="text-sm text-zinc-500">Enable payouts in Stripe to withdraw.</p>
            )}
          </div>
        </div>
      </div>

      {/* Active Subscribers */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Active Subscribers
              </h2>
              <p className="text-sm text-zinc-500">
                {totalSubs} subscriber{totalSubs !== 1 ? 's' : ''} · Est. MRR{' '}
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {formatCents(mrr)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {tierSummaries.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500">No active subscribers yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Share your stories and subscription tiers to start earning
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-6 py-3 text-zinc-500 font-medium">Tier</th>
                  <th className="text-right px-6 py-3 text-zinc-500 font-medium">Subscribers</th>
                  <th className="text-right px-6 py-3 text-zinc-500 font-medium">MRR (your share)</th>
                </tr>
              </thead>
              <tbody>
                {tierSummaries.map((t) => (
                  <tr
                    key={t.tier_name}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                      {PLATFORM_CONFIG.TIER_NAMES[t.tier_name as keyof typeof PLATFORM_CONFIG.TIER_NAMES] ?? t.tier_name}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                      {t.count}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                      {formatCents(
                        Math.round(
                          t.total_cents * (1 - PLATFORM_CONFIG.PLATFORM_FEE_PERCENT / 100)
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revenue History */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Revenue History
            </h2>
            <p className="text-sm text-zinc-500">{revenueCount} entries</p>
          </div>
        </div>

        {revenue.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500">No revenue entries yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Revenue will appear here when subscribers are charged
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left px-6 py-3 text-zinc-500 font-medium">Date</th>
                    <th className="text-left px-6 py-3 text-zinc-500 font-medium">Description</th>
                    <th className="text-right px-6 py-3 text-zinc-500 font-medium">Gross</th>
                    <th className="text-right px-6 py-3 text-zinc-500 font-medium">Fee</th>
                    <th className="text-right px-6 py-3 text-zinc-500 font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                    >
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100">
                        {r.description}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-700 dark:text-zinc-300">
                        {formatCents(r.gross_amount_cents)}
                      </td>
                      <td className="px-6 py-4 text-right text-red-500 dark:text-red-400">
                        -{formatCents(r.platform_fee_cents)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCents(r.net_amount_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalRevenuePages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500">
                  Page {revenuePage + 1} of {totalRevenuePages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={revenuePage === 0}
                    onClick={() => setRevenuePage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={revenuePage >= totalRevenuePages - 1}
                    onClick={() => setRevenuePage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payout History */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Payout History
          </h2>
        </div>

        {payouts.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500">No payouts yet</p>
            <p className="text-sm text-zinc-400 mt-1">
              Payouts will appear here once you request them
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left px-6 py-3 text-zinc-500 font-medium">Date</th>
                  <th className="text-right px-6 py-3 text-zinc-500 font-medium">Amount</th>
                  <th className="text-center px-6 py-3 text-zinc-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-zinc-500 font-medium">Period</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/50 last:border-0"
                  >
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-100">
                      {formatCents(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {p.period_start && p.period_end
                        ? `${new Date(p.period_start).toLocaleDateString()} – ${new Date(
                            p.period_end
                          ).toLocaleDateString()}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
