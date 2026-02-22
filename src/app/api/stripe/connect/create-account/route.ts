import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Check if author already has a Stripe Connect account
    const { data: existing } = await adminSupabase
      .from('author_stripe_accounts')
      .select('stripe_account_id, onboarding_complete')
      .eq('author_id', user.id)
      .maybeSingle();

    let stripeAccountId: string;

    if (existing?.stripe_account_id) {
      stripeAccountId = existing.stripe_account_id;
    } else {
      // Create new Stripe Connect Express account
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        metadata: { author_id: user.id },
      });

      stripeAccountId = account.id;

      // Save to database
      await adminSupabase.from('author_stripe_accounts').upsert({
        author_id: user.id,
        stripe_account_id: account.id,
        onboarding_complete: false,
        payouts_enabled: false,
        updated_at: new Date().toISOString(),
      });
    }

    // Create onboarding link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fictionry-beige.vercel.app';
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/author/dashboard/monetization?refresh=true`,
      return_url: `${siteUrl}/author/dashboard/monetization?onboarding=complete`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Create Connect account error:', error);
    return NextResponse.json(
      { error: 'Failed to create Connect account' },
      { status: 500 }
    );
  }
}
