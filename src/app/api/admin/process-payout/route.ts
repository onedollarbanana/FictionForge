import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
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

    const { author_id, amount_cents: requestedAmount } = await request.json();

    if (!author_id) {
      return NextResponse.json({ error: 'author_id is required' }, { status: 400 });
    }

    const admin = createAdminClient();

    // Fetch author's Stripe account
    const { data: account, error: accError } = await admin
      .from('author_stripe_accounts')
      .select('*')
      .eq('author_id', author_id)
      .single();

    if (accError || !account) {
      return NextResponse.json({ error: 'Author Stripe account not found' }, { status: 404 });
    }

    if (account.payout_hold) {
      return NextResponse.json(
        { error: 'Author account is on hold. Remove hold before processing payout.' },
        { status: 400 }
      );
    }

    if (!account.payouts_enabled) {
      return NextResponse.json(
        { error: 'Payouts are not enabled for this account' },
        { status: 400 }
      );
    }

    if (account.status !== 'active') {
      return NextResponse.json(
        { error: 'Onboarding is not complete for this account' },
        { status: 400 }
      );
    }

    const payoutAmount = requestedAmount || account.balance_cents;

    if (payoutAmount < 2000) {
      return NextResponse.json(
        { error: 'Minimum payout amount is $20.00' },
        { status: 400 }
      );
    }

    if (account.balance_cents < payoutAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: $${(account.balance_cents / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    if (!account.stripe_account_id) {
      return NextResponse.json(
        { error: 'No Stripe account ID on record' },
        { status: 400 }
      );
    }

    // Create Stripe transfer to connected account
    let transfer;
    try {
      transfer = await getStripe().transfers.create({
        amount: payoutAmount,
        currency: 'usd',
        destination: account.stripe_account_id,
      });
    } catch (stripeError: any) {
      return NextResponse.json(
        { error: `Stripe transfer failed: ${stripeError.message}` },
        { status: 500 }
      );
    }

    // Insert payout record. IMPORTANT: the Stripe transfer has already executed above.
    // If this insert fails we must still deduct the balance and log the transfer ID
    // so an admin can reconcile manually — do not return 500 and leave the DB stale.
    const now = new Date().toISOString();
    const { data: payout, error: insertError } = await admin
      .from('payouts')
      .insert({
        author_id,
        amount_cents: payoutAmount,
        stripe_transfer_id: transfer.id,
        status: 'paid',
        processed_by: user.id,
        period_end: now,
        created_at: now,
      })
      .select()
      .single();

    if (insertError) {
      // Transfer already happened — log with the Stripe transfer ID for manual reconciliation
      console.error(
        `Payout record insert failed after Stripe transfer ${transfer.id} for author ${author_id}:`,
        insertError
      );
    }

    // Deduct from author's balance regardless of whether the payout record insert succeeded
    const { error: balanceError } = await admin
      .from('author_stripe_accounts')
      .update({
        balance_cents: account.balance_cents - payoutAmount,
        total_paid_out_cents: (account.total_paid_out_cents ?? 0) + payoutAmount,
      })
      .eq('author_id', author_id);

    if (balanceError) {
      console.error('Balance update error after transfer:', balanceError);
    }

    return NextResponse.json({
      success: true,
      payout: {
        id: payout?.id ?? null,
        amount_cents: payoutAmount,
        status: 'paid',
        stripe_transfer_id: transfer.id,
      },
    });
  } catch (error: any) {
    console.error('Process payout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
