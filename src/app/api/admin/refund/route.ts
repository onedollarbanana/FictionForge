import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!); }

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

    const { transaction_id, reason } = await request.json();

    if (!transaction_id) {
      return NextResponse.json({ error: 'transaction_id is required' }, { status: 400 });
    }

    // Look up the transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (txError || !transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status !== 'succeeded') {
      return NextResponse.json({ error: 'Only succeeded transactions can be refunded' }, { status: 400 });
    }

    if (!transaction.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'Transaction has no Stripe payment intent' }, { status: 400 });
    }

    // Create Stripe refund
    let stripeRefund;
    try {
      stripeRefund = await getStripe().refunds.create({
        payment_intent: transaction.stripe_payment_intent_id,
        reason: 'requested_by_customer',
      });
    } catch (stripeError: any) {
      return NextResponse.json(
        { error: `Stripe refund failed: ${stripeError.message}` },
        { status: 500 }
      );
    }

    // Update original transaction status to 'refunded'
    await supabase
      .from('transactions')
      .update({ status: 'refunded' })
      .eq('id', transaction_id);

    // Audit log
    console.info('[ADMIN_AUDIT] refund', {
      admin_user_id: user.id,
      transaction_id,
      amount_cents: transaction.amount_cents,
      stripe_refund_id: stripeRefund.id,
      reason: reason || null,
    });

    // Create a new refund transaction record
    await supabase.from('transactions').insert({
      user_id: transaction.user_id,
      subscription_id: transaction.subscription_id,
      type: 'refund',
      status: 'succeeded',
      amount_cents: -transaction.amount_cents,
      currency: transaction.currency,
      stripe_payment_intent_id: transaction.stripe_payment_intent_id,
      author_id: transaction.author_id,
      description: reason ? `Refund by ${user.id}: ${reason}` : `Refund by ${user.id} for transaction ${transaction_id}`,
    });

    // Handle author_subscription_payment refund
    if (transaction.type === 'author_subscription_payment' && transaction.author_id) {
      const authorEarning = transaction.author_earning_cents ?? 0;
      const platformFee = transaction.platform_fee_cents ?? 0;
      const grossAmount = transaction.amount_cents ?? 0;

      // Insert a negative author_revenue record to reverse the earnings
      await supabase.from('author_revenue').insert({
        author_id: transaction.author_id,
        subscription_id: transaction.subscription_id ?? null,
        gross_amount_cents: -grossAmount,
        platform_fee_cents: -platformFee,
        net_amount_cents: -authorEarning,
        description: reason ? `Refund: ${reason}` : `Refund for transaction ${transaction_id}`,
      });

      // Deduct from author's balance (floor at 0)
      const { data: account } = await supabase
        .from('author_stripe_accounts')
        .select('balance_cents')
        .eq('author_id', transaction.author_id)
        .single();

      if (account) {
        await supabase
          .from('author_stripe_accounts')
          .update({
            balance_cents: Math.max(0, (account.balance_cents ?? 0) - authorEarning),
          })
          .eq('author_id', transaction.author_id);
      }
    }

    // Handle reader_premium_payment refund
    if (transaction.type === 'reader_premium_payment') {
      // Set user's is_premium to false
      if (transaction.user_id) {
        await supabase
          .from('profiles')
          .update({ is_premium: false })
          .eq('id', transaction.user_id);
      }

      // Cancel the Stripe subscription and update DB
      if (transaction.subscription_id) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('id', transaction.subscription_id)
          .single();

        if (subscription?.stripe_subscription_id) {
          try {
            await getStripe().subscriptions.cancel(subscription.stripe_subscription_id);
          } catch (e: any) {
            console.error('Failed to cancel Stripe subscription:', e.message);
          }
        }

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('id', transaction.subscription_id);
      }
    }

    return NextResponse.json({
      success: true,
      refund_id: stripeRefund.id,
      amount_refunded: transaction.amount_cents,
      transaction_id,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
