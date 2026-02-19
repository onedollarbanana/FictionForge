/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nxcxakqkddmbunmipsej.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

// Only apply Sentry build-time instrumentation when DSN is configured.
// This avoids unnecessary build overhead when Sentry is not in use.
// The runtime SDK (sentry.*.config.ts) handles error capture independently.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const { withSentryConfig } = require("@sentry/nextjs");
  module.exports = withSentryConfig(nextConfig, {
    // Suppresses source map uploading logs during build
    silent: true,
    
    // Upload source maps for better stack traces
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    
    // Hides source maps from generated client bundles
    hideSourceMaps: true,
    
    // Automatically tree-shake Sentry logger statements
    disableLogger: true,
  }, {
    // Route handler & page errors will be caught by Sentry
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  });
} else {
  module.exports = nextConfig;
}
