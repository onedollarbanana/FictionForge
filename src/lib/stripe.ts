import Stripe from 'stripe';

// Server-side Stripe client (lazy init to avoid build-time errors)
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return _stripe;
}
// Backward compat — some files import { stripe }
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

// Platform configuration — easy to adjust
// These values can be overridden via the platform_config table in Supabase
export const PLATFORM_DEFAULTS = {
  AUTHOR_REVENUE_SHARE: 0.85, // 85% to authors
  MIN_PAYOUT_AMOUNT_CENTS: 2000, // $20 minimum payout
  READER_PREMIUM_MONTHLY_CENTS: 300, // $3/month
  READER_PREMIUM_ANNUAL_CENTS: 3000, // $30/year
};

// Get a config value from the platform_config table
export async function getPlatformConfig(key: string): Promise<string | null> {
  // Dynamic import to avoid circular deps
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase
    .from('platform_config')
    .select('value')
    .eq('key', key)
    .single();
  return data?.value ?? null;
}
