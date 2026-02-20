// Platform revenue configuration
// Single source of truth for revenue split
export const PLATFORM_CONFIG = {
  // Platform takes 15%, author gets 85%
  PLATFORM_FEE_PERCENT: 15,

  // Fixed tier prices in cents
  TIER_PRICES: {
    supporter: 300,   // $3/month
    enthusiast: 600,  // $6/month
    patron: 1200,     // $12/month
  },

  // Tier display names
  TIER_NAMES: {
    supporter: 'Supporter',
    enthusiast: 'Enthusiast',
    patron: 'Patron',
  },

  // Minimum payout threshold in cents
  MIN_PAYOUT_CENTS: 2000, // $20
} as const;

export type TierName = keyof typeof PLATFORM_CONFIG.TIER_PRICES;
