"use client";

import { useEffect, useState } from "react";

interface ScheduleWarningProps {
  scheduledFor: string;
}

export function ScheduleWarning({ scheduledFor }: ScheduleWarningProps) {
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!scheduledFor) {
      setWarning(null);
      return;
    }

    function check() {
      const scheduledTime = new Date(scheduledFor).getTime();
      const now = Date.now();
      const fiveMin = 5 * 60 * 1000;

      if (isNaN(scheduledTime)) {
        setWarning("Invalid date/time entered.");
      } else if (scheduledTime < now) {
        setWarning("This time is in the past. Please choose a future date.");
      } else if (scheduledTime < now + fiveMin) {
        const mins = Math.ceil((scheduledTime - now) / 60000);
        setWarning(`Only ${mins} minute${mins === 1 ? "" : "s"} from now — must be at least 5 minutes in the future.`);
      } else {
        setWarning(null);
      }
    }

    check();
    // Re-check every 30s so the warning updates as time passes
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [scheduledFor]);

  if (!warning) return null;

  return (
    <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {warning}
    </p>
  );
}
