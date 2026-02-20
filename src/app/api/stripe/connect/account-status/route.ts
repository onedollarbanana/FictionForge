import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Look up author's Stripe Connect account
    const { data: accountRecord } = await adminSupabase
      .from('author_stripe_accounts')
      .select('stripe_account_id, onboarding_complete, payouts_enabled')
      .eq('author_id', user.id)
      .maybeSingle();

    if (!accountRecord?.stripe_account_id) {
      return NextResponse.json({
        has_account: false,
        onboarding_complete: false,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      });
    }

    // Fetch current status from Stripe
    const stripeAccount = await stripe.accounts.retrieve(accountRecord.stripe_account_id);

    const status = {
      has_account: true,
      onboarding_complete: stripeAccount.details_submitted ?? false,
      charges_enabled: stripeAccount.charges_enabled ?? false,
      payouts_enabled: stripeAccount.payouts_enabled ?? false,
      details_submitted: stripeAccount.details_submitted ?? false,
    };

    // Update local database with current Stripe status
    await adminSupabase
      .from('author_stripe_accounts')
      .update({
        onboarding_complete: status.details_submitted,
        payouts_enabled: status.payouts_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('author_id', user.id);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Account status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account status' },
      { status: 500 }
    );
  }
}
