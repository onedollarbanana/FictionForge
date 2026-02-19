import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interval } = await request.json(); // 'monthly' or 'annual'
    
    // Check if user already has an active premium subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'reader_premium')
      .eq('status', 'active')
      .maybeSingle();
    
    if (existingSub) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, username, display_name')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id, username: profile?.username || '' },
      });
      stripeCustomerId = customer.id;
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id);
    }

    // Create or find the price using lookup keys
    const lookupKey = interval === 'annual' ? 'reader_premium_annual' : 'reader_premium_monthly';
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 });
    
    let priceId: string;
    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
    } else {
      // Create product and price if they don't exist
      const product = await stripe.products.create({
        name: 'Reader Premium',
        description: interval === 'annual' 
          ? 'Reader Premium - Annual (save $6/year!)' 
          : 'Reader Premium - Monthly',
        metadata: { type: 'reader_premium' },
      });
      
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: interval === 'annual' ? 3000 : 300,
        currency: 'usd',
        recurring: { interval: interval === 'annual' ? 'year' : 'month' },
        lookup_key: lookupKey,
      });
      priceId = price.id;
    }

    // Determine base URL
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings/billing?success=true`,
      cancel_url: `${origin}/settings/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        type: 'reader_premium',
        interval,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          type: 'reader_premium',
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
