import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Use service role for webhook operations (not user-scoped)
function getAdminSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type AdminClient = ReturnType<typeof getAdminSupabase>;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.type === 'reader_premium' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          await handleSubscriptionCreated(supabase, subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(supabase, invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }
    }
  } catch (error) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// Helper to safely get period timestamps from subscription
// Stripe v20 types may not expose these directly but they're in the API response
function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any;
  const start = sub.current_period_start;
  const end = sub.current_period_end;
  return {
    start: typeof start === 'number' ? new Date(start * 1000).toISOString() : new Date().toISOString(),
    end: typeof end === 'number' ? new Date(end * 1000).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
  };
}

// Helper to safely access Invoice properties that Stripe v20 types don't expose
// These fields still exist in the API response but were removed from TypeScript types
function getInvoiceFields(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any;
  return {
    subscription: inv.subscription as string | null,
    amountPaid: (inv.amount_paid ?? inv.amountPaid ?? 0) as number,
    hostedInvoiceUrl: (inv.hosted_invoice_url ?? inv.hostedInvoiceUrl ?? null) as string | null,
    paymentIntent: (typeof inv.payment_intent === 'string' ? inv.payment_intent : null) as string | null,
  };
}

async function handleSubscriptionCreated(
  supabase: AdminClient,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  const item = subscription.items.data[0];
  const interval = item.price.recurring?.interval === 'year' ? 'annual' : 'monthly';
  const period = getSubscriptionPeriod(subscription);

  // Upsert subscription record
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    type: 'reader_premium',
    status: 'active',
    billing_interval: interval,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    stripe_price_id: item.price.id,
    amount_cents: item.price.unit_amount || (interval === 'annual' ? 3000 : 300),
    currency: item.price.currency || 'usd',
    current_period_start: period.start,
    current_period_end: period.end,
    cancel_at_period_end: subscription.cancel_at_period_end,
  }, { onConflict: 'stripe_subscription_id' });

  // Update profile premium status
  await supabase
    .from('profiles')
    .update({ is_premium: true })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(
  supabase: AdminClient,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  const mapStatus = (s: string): string => {
    switch (s) {
      case 'active': return 'active';
      case 'past_due': return 'past_due';
      case 'canceled': return 'canceled';
      case 'incomplete': return 'incomplete';
      case 'trialing': return 'trialing';
      default: return 'incomplete';
    }
  };

  const period = getSubscriptionPeriod(subscription);

  await supabase
    .from('subscriptions')
    .update({
      status: mapStatus(subscription.status),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
      current_period_start: period.start,
      current_period_end: period.end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Update premium status
  const isPremium = subscription.status === 'active' || subscription.status === 'trialing';
  await supabase
    .from('profiles')
    .update({ is_premium: isPremium })
    .eq('id', userId);
}

async function handleSubscriptionDeleted(
  supabase: AdminClient,
  subscription: Stripe.Subscription
) {
  const userId = subscription.metadata.user_id;
  if (!userId) return;

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Check if user has any other active premium subs
  const { data: otherSubs } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'reader_premium')
    .eq('status', 'active')
    .neq('stripe_subscription_id', subscription.id);

  if (!otherSubs || otherSubs.length === 0) {
    await supabase
      .from('profiles')
      .update({ is_premium: false })
      .eq('id', userId);
  }
}

async function handleInvoicePaid(
  supabase: AdminClient,
  invoice: Stripe.Invoice
) {
  const inv = getInvoiceFields(invoice);
  if (!inv.subscription) return;

  // Get subscription to find user
  const sub = await stripe.subscriptions.retrieve(inv.subscription);
  const userId = sub.metadata.user_id;
  if (!userId) return;

  // Find our subscription record
  const { data: dbSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', inv.subscription)
    .maybeSingle();

  await supabase.from('transactions').insert({
    user_id: userId,
    subscription_id: dbSub?.id || null,
    type: 'reader_premium_payment',
    status: 'succeeded',
    amount_cents: inv.amountPaid,
    currency: invoice.currency,
    stripe_payment_intent_id: inv.paymentIntent,
    stripe_invoice_id: invoice.id,
    stripe_receipt_url: inv.hostedInvoiceUrl,
    description: `Reader Premium - ${sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'Annual' : 'Monthly'}`,
  });
}

async function handlePaymentFailed(
  supabase: AdminClient,
  invoice: Stripe.Invoice
) {
  const inv = getInvoiceFields(invoice);
  if (!inv.subscription) return;

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', inv.subscription);
}
