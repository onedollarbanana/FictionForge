"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Sentry Test Page</h1>
        <p className="text-muted-foreground">Click the button to send a test error to Sentry.</p>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          onClick={async () => {
            await Sentry.startSpan({ name: "Example Frontend Span" }, async () => {
              const res = await fetch("/api/sentry-example-api");
              if (!res.ok) {
                throw new Error("Sentry Example Frontend Error");
              }
            });
          }}
        >
          Throw Test Error
        </button>
      </div>
    </div>
  );
}
