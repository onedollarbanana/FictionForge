import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  
  // Only enable if DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  tracesSampleRate: 0.1, // 10% of transactions for performance
  replaysSessionSampleRate: 0, // Don't record sessions
  replaysOnErrorSampleRate: 0.5, // Record 50% of sessions with errors
  
  // Don't send in development
  environment: process.env.NODE_ENV,
});
