/** @type {import('next').NextConfig} */
const withSerwist = require("@serwist/next").default;

const baseConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nxcxakqkddmbunmipsej.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

const nextConfig = withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})(baseConfig);

// Only apply Sentry build-time instrumentation when DSN is configured.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const { withSentryConfig } = require("@sentry/nextjs");
  module.exports = withSentryConfig(nextConfig, {
    silent: true,
    
    // Disable source map uploading unless auth token is provided
    // This prevents build timeouts on Vercel
    // To enable: add SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT env vars
    ...(process.env.SENTRY_AUTH_TOKEN ? {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    } : {}),
    
    hideSourceMaps: true,
    disableLogger: true,
  }, {
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    // Skip source map upload if no auth token
    disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
    disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  });
} else {
  module.exports = nextConfig;
}
