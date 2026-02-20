'use client';

import { useState, useEffect } from 'react';

const periods = [
  { key: 'this_month', label: 'This Month' },
  { key: 'last_3_months', label: 'Last 3 Months' },
  { key: 'this_year', label: 'This Year' },
  { key: 'all_time', label: 'All Time' },
];

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function FinancialReport() {
  const [period, setPeriod] = useState('this_month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/financial-report?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading report...</div>
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Failed to load report</div>
      </div>
    );
  }

  const { summary, monthlyBreakdown, subscriptions, topAuthors } = data;
  const platformRevenue = (summary.totalPlatformFees ?? 0) - (summary.totalStripeFees ?? 0);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              period === p.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Gross Revenue</p>
          <p className="text-2xl font-bold mt-1">{fmt(summary.grossRevenue ?? 0)}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Platform Revenue</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{fmt(platformRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Fees minus Stripe costs</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Author Payouts</p>
          <p className="text-2xl font-bold mt-1">{fmt(summary.totalAuthorEarnings ?? 0)}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Refunds</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{fmt(summary.totalRefunds ?? 0)}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">MRR</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{fmt(summary.mrr ?? 0)}</p>
          <p className="text-xs text-muted-foreground mt-1">Monthly Recurring Revenue</p>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Monthly Breakdown</h3>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Month</th>
                <th className="text-right p-3 font-medium">Gross</th>
                <th className="text-right p-3 font-medium">Platform Fees</th>
                <th className="text-right p-3 font-medium">Stripe Fees</th>
                <th className="text-right p-3 font-medium">Author Earnings</th>
                <th className="text-right p-3 font-medium">Refunds</th>
                <th className="text-right p-3 font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {(!monthlyBreakdown || monthlyBreakdown.length === 0) ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">No data for this period</td>
                </tr>
              ) : (
                monthlyBreakdown.map((row: any) => (
                  <tr key={row.month} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.month}</td>
                    <td className="p-3 text-right font-mono">{fmt(row.gross)}</td>
                    <td className="p-3 text-right font-mono">{fmt(row.platformFees)}</td>
                    <td className="p-3 text-right font-mono">{fmt(row.stripeFees)}</td>
                    <td className="p-3 text-right font-mono">{fmt(row.authorEarnings)}</td>
                    <td className="p-3 text-right font-mono text-red-600">{fmt(row.refunds)}</td>
                    <td className="p-3 text-right font-mono font-semibold">{fmt(row.gross - row.refunds)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Stats */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Subscription Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
            <p className="text-2xl font-bold mt-1">{subscriptions.totalActive}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">New in Period</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{subscriptions.newInPeriod}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Churned in Period</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{subscriptions.canceledInPeriod}</p>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">By Type</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reader Premium</span>
                <span className="font-medium">{subscriptions.byType?.reader_premium ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Author Support</span>
                <span className="font-medium">{subscriptions.byType?.author_support ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Earning Authors */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Top 10 Earning Authors</h3>
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">#</th>
                <th className="text-left p-3 font-medium">Author</th>
                <th className="text-right p-3 font-medium">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {(!topAuthors || topAuthors.length === 0) ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">No author earnings in this period</td>
                </tr>
              ) : (
                topAuthors.map((author: any, idx: number) => (
                  <tr key={author.authorId} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 text-muted-foreground">{idx + 1}</td>
                    <td className="p-3 font-medium">{author.username}</td>
                    <td className="p-3 text-right font-mono font-semibold">{fmt(author.earnings)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
