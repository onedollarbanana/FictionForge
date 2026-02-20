import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Called after checkout redirect to sync subscription immediately
// This is a fast-path so users see premium status right away
// The webhook is the reliable backup for all lifecycle events
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the most recent checkout session for this user
    const sessions = await stripe.checkout.sessions.list({
      limit: 5,
    });

    const session = sessions.data.find(
      (s) => s.metadata?.user_id === user.id && 
             s.metadata?.type === 'reader_premium' &&
             s.status === 'complete' &&
             s.subscription
    );

    if (!session || !session.subscription) {
      return NextResponse.json({ error: 'No completed session found' }, { status: 404 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    const item = subscription.items.data[0];
    const interval = item.price.recurring?.interval === 'year' ? 'annual' : 'monthly';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any;
    const periodStart = typeof sub.current_period_start === 'number'
      ? new Date(sub.current_period_start * 1000).toISOString()
      : new Date().toISOString();
    const periodEnd = typeof sub.current_period_end === 'number'
      ? new Date(sub.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString();

    const adminSupabase = getAdminSupabase();

    // Upsert subscription record
    await adminSupabase.from('subscriptions').upsert({
      user_id: user.id,
      type: 'reader_premium',
      status: 'active',
      billing_interval: interval,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      stripe_price_id: item.price.id,
      amount_cents: item.price.unit_amount || (interval === 'annual' ? 3000 : 300),
      currency: item.price.currency || 'usd',
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
    }, { onConflict: 'stripe_subscription_id' });

    // Set premium status
    await adminSupabase
      .from('profiles')
      .update({ is_premium: true })
      .eq('id', user.id);

    return NextResponse.json({ 
      success: true, 
      subscription: {
        status: 'active',
        billing_interval: interval,
        amount_cents: item.price.unit_amount || (interval === 'annual' ? 3000 : 300),
        current_period_end: periodEnd,
        cancel_at_period_end: false,
      }
    });
  } catch (error) {
    console.error('Verify session error:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
