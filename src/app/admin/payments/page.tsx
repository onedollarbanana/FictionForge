export const dynamic = 'force-dynamic';

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { RefundButton } from "./refund-button";
import { HoldButton, ProcessPayoutButton } from "./payout-actions";
import { ScanButton, ReviewButton } from "./fraud-actions";
import { FinancialReport } from "./financial-report";

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'subscriptions', label: 'Subscriptions' },
  { key: 'authors', label: 'Author Accounts' },
  { key: 'payouts', label: 'Payouts' },
  { key: 'fraud', label: 'Fraud Alerts' },
  { key: 'reports', label: 'Reports' },
];

function formatCurrency(cents: number | null): string {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function formatDate(timestamp: string | null): string {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString();
}

function StatusBadge({ status, colorMap }: { status: string | null; colorMap?: Record<string, string> }) {
  const defaultColors: Record<string, string> = {
    succeeded: 'bg-green-100 text-green-800',
    active: 'bg-green-100 text-green-800',
    paid: 'bg-green-100 text-green-800',
    complete: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-yellow-100 text-yellow-800',
    incomplete: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    refunded: 'bg-blue-100 text-blue-800',
    trialing: 'bg-blue-100 text-blue-800',
    past_due: 'bg-orange-100 text-orange-800',
    not_started: 'bg-gray-100 text-gray-800',
  };
  const colors = { ...defaultColors, ...colorMap };
  const s = status ?? 'unknown';
  const color = colors[s] ?? 'bg-gray-100 text-gray-800';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', color)}>
      {s}
    </span>
  );
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const tab = params.tab || 'overview';
  const supabase = await createClient();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Payments</h2>
        <p className="text-muted-foreground">Monitor transactions, subscriptions, and payouts</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/payments?tab=${t.key}`}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab />}
      {tab === 'transactions' && <TransactionsTab />}
      {tab === 'subscriptions' && <SubscriptionsTab />}
      {tab === 'authors' && <AuthorAccountsTab />}
      {tab === 'payouts' && <PayoutsTab />}
      {tab === 'fraud' && <FraudTab />}
      {tab === 'reports' && <FinancialReport />}
    </div>
  );
}

async function OverviewTab() {
  const supabase = await createClient();

  // Get totals from succeeded transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount_cents, platform_fee_cents, author_earning_cents')
    .eq('status', 'succeeded');

  const totalRevenue = transactions?.reduce((sum, t) => sum + (t.amount_cents ?? 0), 0) ?? 0;
  const platformFees = transactions?.reduce((sum, t) => sum + (t.platform_fee_cents ?? 0), 0) ?? 0;
  const authorEarnings = transactions?.reduce((sum, t) => sum + (t.author_earning_cents ?? 0), 0) ?? 0;

  // Count active subscriptions
  const { count: activeSubscribers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Platform Fees', value: formatCurrency(platformFees) },
    { label: 'Author Earnings', value: formatCurrency(authorEarnings) },
    { label: 'Active Subscribers', value: String(activeSubscribers ?? 0) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">{m.label}</p>
          <p className="text-2xl font-bold mt-1">{m.value}</p>
        </div>
      ))}
    </div>
  );
}

async function TransactionsTab() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*, profiles!transactions_user_id_fkey(username)')
    .order('created_at', { ascending: false })
    .limit(100);

  const typeColors: Record<string, string> = {
    subscription: 'bg-purple-100 text-purple-800',
    tip: 'bg-pink-100 text-pink-800',
    premium: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">User</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-right p-3 font-medium">Amount</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Stripe ID</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(!transactions || transactions.length === 0) ? (
            <tr>
              <td colSpan={7} className="p-6 text-center text-muted-foreground">No transactions found</td>
            </tr>
          ) : (
            transactions.map((tx: any) => (
              <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 whitespace-nowrap">{formatDate(tx.created_at)}</td>
                <td className="p-3">{tx.profiles?.username ?? 'Unknown'}</td>
                <td className="p-3">
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', typeColors[tx.type] ?? 'bg-gray-100 text-gray-800')}>
                    {tx.type ?? 'unknown'}
                  </span>
                </td>
                <td className="p-3 text-right font-mono">{formatCurrency(tx.amount_cents)}</td>
                <td className="p-3"><StatusBadge status={tx.status} /></td>
                <td className="p-3 font-mono text-xs text-muted-foreground truncate max-w-[200px]">{tx.stripe_payment_intent_id ?? '—'}</td>
                <td className="p-3">
                  {tx.status === 'succeeded' && (
                    <RefundButton transactionId={tx.id} amount={tx.amount_cents} />
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

async function SubscriptionsTab() {
  const supabase = await createClient();

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*, profiles!subscriptions_user_id_fkey(username), author:profiles!subscriptions_author_id_fkey(username)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">User</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Tier</th>
            <th className="text-right p-3 font-medium">Amount</th>
            <th className="text-left p-3 font-medium">Interval</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Started</th>
            <th className="text-left p-3 font-medium">Ends</th>
          </tr>
        </thead>
        <tbody>
          {(!subscriptions || subscriptions.length === 0) ? (
            <tr>
              <td colSpan={8} className="p-6 text-center text-muted-foreground">No subscriptions found</td>
            </tr>
          ) : (
            subscriptions.map((sub: any) => (
              <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">{sub.profiles?.username ?? 'Unknown'}</td>
                <td className="p-3">
                  <span className="text-xs">
                    {sub.type ?? '—'}
                    {sub.type === 'author' && sub.author?.username ? ` → ${sub.author.username}` : ''}
                  </span>
                </td>
                <td className="p-3">{sub.tier_name ?? '—'}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(sub.amount_cents)}</td>
                <td className="p-3">{sub.billing_interval ?? '—'}</td>
                <td className="p-3"><StatusBadge status={sub.status} /></td>
                <td className="p-3 whitespace-nowrap">{formatDate(sub.current_period_start)}</td>
                <td className="p-3 whitespace-nowrap">{formatDate(sub.current_period_end)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

async function AuthorAccountsTab() {
  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from('author_stripe_accounts')
    .select('*, profiles!author_stripe_accounts_author_id_fkey(username)')
    .order('created_at', { ascending: false });

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Author</th>
            <th className="text-left p-3 font-medium">Stripe Account</th>
            <th className="text-left p-3 font-medium">Onboarding</th>
            <th className="text-left p-3 font-medium">Payouts Enabled</th>
            <th className="text-right p-3 font-medium">Balance</th>
            <th className="text-right p-3 font-medium">Total Earned</th>
            <th className="text-left p-3 font-medium">Hold Status</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(!accounts || accounts.length === 0) ? (
            <tr>
              <td colSpan={8} className="p-6 text-center text-muted-foreground">No author accounts found</td>
            </tr>
          ) : (
            accounts.map((acc: any) => (
              <tr key={acc.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">{acc.profiles?.username ?? 'Unknown'}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{acc.stripe_account_id ?? '—'}</td>
                <td className="p-3"><StatusBadge status={acc.status} /></td>
                <td className="p-3">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    acc.payouts_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {acc.payouts_enabled ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-3 text-right font-mono">{formatCurrency(acc.balance_cents)}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(acc.total_earned_cents)}</td>
                <td className="p-3">
                  {acc.payout_hold ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help"
                      title={acc.hold_reason || 'No reason provided'}
                    >
                      On Hold
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Active
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <HoldButton authorId={acc.author_id} isHeld={acc.payout_hold} />
                    {!acc.payout_hold && acc.balance_cents >= 2000 && (
                      <ProcessPayoutButton authorId={acc.author_id} balanceCents={acc.balance_cents} />
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

async function PayoutsTab() {
  const supabase = await createClient();

  const { data: payouts } = await supabase
    .from('payouts')
    .select('*, author:profiles!payouts_author_id_fkey(username), processor:profiles!payouts_processed_by_fkey(username)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium">Date</th>
            <th className="text-left p-3 font-medium">Author</th>
            <th className="text-right p-3 font-medium">Amount</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Stripe ID</th>
            <th className="text-left p-3 font-medium">Processed By</th>
          </tr>
        </thead>
        <tbody>
          {(!payouts || payouts.length === 0) ? (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted-foreground">No payouts found</td>
            </tr>
          ) : (
            payouts.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3 whitespace-nowrap">{formatDate(p.created_at)}</td>
                <td className="p-3">{p.author?.username ?? 'Unknown'}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(p.amount_cents)}</td>
                <td className="p-3"><StatusBadge status={p.status} /></td>
                <td className="p-3 font-mono text-xs text-muted-foreground">{p.stripe_payout_id ?? '—'}</td>
                <td className="p-3">{p.processor?.username ?? '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

async function FraudTab() {
  const supabase = await createClient();

  const { data: flags } = await supabase
    .from('fraud_flags')
    .select('*, profiles!fraud_flags_user_id_fkey(username)')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  const statusColors: Record<string, string> = {
    open: 'bg-red-100 text-red-800',
    reviewed: 'bg-green-100 text-green-800',
    dismissed: 'bg-gray-100 text-gray-800',
  };

  const typeLabels: Record<string, string> = {
    rapid_cancel: 'Rapid Cancel',
    high_volume_subs: 'High Volume Subs',
    excessive_refunds: 'Excessive Refunds',
    suspicious_pattern: 'Suspicious Pattern',
  };

  function formatDetails(details: Record<string, any>): string {
    return Object.entries(details)
      .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
      .join(', ');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Fraud Alerts</h3>
        <ScanButton />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Details</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(!flags || flags.length === 0) ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">No fraud flags found. Run a scan to check.</td>
              </tr>
            ) : (
              flags.map((flag: any) => (
                <tr key={flag.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 whitespace-nowrap">{formatDate(flag.created_at)}</td>
                  <td className="p-3">{flag.profiles?.username ?? 'Unknown'}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {typeLabels[flag.flag_type] ?? flag.flag_type}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground max-w-[300px] truncate">
                    {formatDetails(flag.details ?? {})}
                  </td>
                  <td className="p-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', statusColors[flag.status] ?? 'bg-gray-100 text-gray-800')}>
                      {flag.status}
                    </span>
                    {flag.review_notes && (
                      <span className="block text-xs text-muted-foreground mt-1" title={flag.review_notes}>
                        {flag.review_notes.substring(0, 50)}{flag.review_notes.length > 50 ? '...' : ''}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <ReviewButton flagId={flag.id} currentStatus={flag.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
