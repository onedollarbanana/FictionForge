import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let newFlagCount = 0;

    // Rule 1: Rapid Cancel — 3+ cancellations in 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: canceledSubs } = await supabase
      .from('subscriptions')
      .select('user_id, canceled_at')
      .eq('status', 'canceled')
      .gte('canceled_at', thirtyDaysAgo);

    if (canceledSubs) {
      const cancelCounts = new Map<string, number>();
      for (const sub of canceledSubs) {
        const count = (cancelCounts.get(sub.user_id) ?? 0) + 1;
        cancelCounts.set(sub.user_id, count);
      }

      for (const [userId, count] of cancelCounts) {
        if (count >= 3) {
          // Check for existing open flag
          const { data: existing } = await supabase
            .from('fraud_flags')
            .select('id')
            .eq('user_id', userId)
            .eq('flag_type', 'rapid_cancel')
            .eq('status', 'open')
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from('fraud_flags').insert({
              user_id: userId,
              flag_type: 'rapid_cancel',
              details: { cancel_count: count, period: 'last 30 days' },
            });
            newFlagCount++;
          }
        }
      }
    }

    // Rule 2: High Volume Subs — author received 10+ new subscriptions in 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentSubs } = await supabase
      .from('subscriptions')
      .select('author_id, created_at')
      .eq('type', 'author_support')
      .gte('created_at', twentyFourHoursAgo)
      .not('author_id', 'is', null);

    if (recentSubs) {
      const authorSubCounts = new Map<string, { count: number; firstSub: string; lastSub: string }>();
      for (const sub of recentSubs) {
        if (!sub.author_id) continue;
        const existing = authorSubCounts.get(sub.author_id);
        if (existing) {
          existing.count++;
          if (sub.created_at < existing.firstSub) existing.firstSub = sub.created_at;
          if (sub.created_at > existing.lastSub) existing.lastSub = sub.created_at;
        } else {
          authorSubCounts.set(sub.author_id, { count: 1, firstSub: sub.created_at, lastSub: sub.created_at });
        }
      }

      for (const [authorId, data] of authorSubCounts) {
        if (data.count >= 10) {
          const { data: existing } = await supabase
            .from('fraud_flags')
            .select('id')
            .eq('user_id', authorId)
            .eq('flag_type', 'high_volume_subs')
            .eq('status', 'open')
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from('fraud_flags').insert({
              user_id: authorId,
              flag_type: 'high_volume_subs',
              details: {
                subscription_count: data.count,
                period: 'last 24 hours',
                first_sub: data.firstSub,
                last_sub: data.lastSub,
              },
            });
            newFlagCount++;
          }
        }
      }
    }

    // Rule 3: Excessive Refunds — 50%+ refunds with min 4 transactions
    const { data: allTransactions } = await supabase
      .from('transactions')
      .select('user_id, status');

    if (allTransactions) {
      const userTxStats = new Map<string, { total: number; refunded: number }>();
      for (const tx of allTransactions) {
        const stats = userTxStats.get(tx.user_id) ?? { total: 0, refunded: 0 };
        stats.total++;
        if (tx.status === 'refunded') stats.refunded++;
        userTxStats.set(tx.user_id, stats);
      }

      for (const [userId, stats] of userTxStats) {
        if (stats.total >= 4 && stats.refunded / stats.total >= 0.5) {
          const { data: existing } = await supabase
            .from('fraud_flags')
            .select('id')
            .eq('user_id', userId)
            .eq('flag_type', 'excessive_refunds')
            .eq('status', 'open')
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from('fraud_flags').insert({
              user_id: userId,
              flag_type: 'excessive_refunds',
              details: {
                total_transactions: stats.total,
                refund_count: stats.refunded,
                refund_rate: `${Math.round((stats.refunded / stats.total) * 100)}%`,
              },
            });
            newFlagCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      new_flags: newFlagCount,
    });
  } catch (error: any) {
    console.error('Fraud scan error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
