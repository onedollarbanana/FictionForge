'use client'

import * as Sentry from "@sentry/nextjs";
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Don&apos;t worry, even the best stories have plot holes.
            </p>
            <button
              onClick={reset}
              style={{ padding: '0.5rem 1rem', background: '#333', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
