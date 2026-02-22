import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { PLATFORM_CONFIG, type TierName } from '@/lib/platform-config';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authorId, tierName } = await request.json();

    // Validate tier name
    if (!tierName || !(tierName in PLATFORM_CONFIG.TIER_PRICES)) {
      return NextResponse.json(
        { error: 'Invalid tier name. Must be one of: supporter, enthusiast, patron' },
        { status: 400 }
      );
    }

    const validTierName = tierName as TierName;

    if (!authorId) {
      return NextResponse.json({ error: 'Author ID is required' }, { status: 400 });
    }

    // Cannot subscribe to yourself
    if (authorId === user.id) {
      return NextResponse.json({ error: 'Cannot subscribe to yourself' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Validate tier exists and is enabled for this author
    const { data: tier } = await adminSupabase
      .from('author_tiers')
      .select('enabled')
      .eq('author_id', authorId)
      .eq('tier_name', validTierName)
      .maybeSingle();

    if (!tier?.enabled) {
      return NextResponse.json(
        { error: 'This tier is not available for this author' },
        { status: 400 }
      );
    }

    // Check if user already has an active subscription to this author
    const { data: existingSub } = await adminSupabase
      .from('author_subscriptions')
      .select('id')
      .eq('subscriber_id', user.id)
      .eq('author_id', authorId)
      .in('status', ['active', 'incomplete'])
      .maybeSingle();

    if (existingSub) {
      return NextResponse.json(
        { error: 'You already have an active subscription to this author' },
        { status: 400 }
      );
    }

    // Look up author's Stripe Connect account
    const { data: authorAccount } = await adminSupabase
      .from('author_stripe_accounts')
      .select('stripe_account_id, onboarding_complete')
      .eq('author_id', authorId)
      .maybeSingle();

    if (!authorAccount?.stripe_account_id || !authorAccount.onboarding_complete) {
      return NextResponse.json(
        { error: 'This author has not completed payment setup' },
        { status: 400 }
      );
    }

    // Get author profile for display name
    const { data: authorProfile } = await adminSupabase
      .from('profiles')
      .select('username, display_name')
      .eq('id', authorId)
      .single();

    const authorName = authorProfile?.display_name || authorProfile?.username || 'Author';
    const authorUsername = authorProfile?.username || authorId;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fictionry-beige.vercel.app';

    // Create Stripe Checkout session with Connect
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${authorName} - ${PLATFORM_CONFIG.TIER_NAMES[validTierName]} Tier`,
            description: `Monthly subscription to ${authorName}`,
          },
          unit_amount: PLATFORM_CONFIG.TIER_PRICES[validTierName],
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      subscription_data: {
        application_fee_percent: PLATFORM_CONFIG.PLATFORM_FEE_PERCENT,
        transfer_data: {
          destination: authorAccount.stripe_account_id,
        },
        metadata: {
          subscriber_id: user.id,
          author_id: authorId,
          tier_name: validTierName,
          type: 'author_subscription',
        },
      },
      success_url: `${siteUrl}/author/${authorUsername}?subscribed=true`,
      cancel_url: `${siteUrl}/author/${authorUsername}`,
      metadata: {
        subscriber_id: user.id,
        author_id: authorId,
        tier_name: validTierName,
        type: 'author_subscription',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Author subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription checkout' },
      { status: 500 }
    );
  }
}
