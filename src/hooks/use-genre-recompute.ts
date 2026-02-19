'use client';

import { useEffect, useRef } from 'react';

const RECOMPUTE_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes minimum between recomputes

export function useGenreRecompute() {
  const lastRecompute = useRef<number>(0);
  
  useEffect(() => {
    const now = Date.now();
    const lastKey = 'genre_weights_last_recompute';
    const stored = localStorage.getItem(lastKey);
    const lastTime = stored ? parseInt(stored, 10) : 0;
    
    if (now - lastTime < RECOMPUTE_INTERVAL_MS) return;
    
    // Fire and forget - don't block UI
    fetch('/api/recommendations/recompute', { method: 'POST' })
      .then(() => {
        localStorage.setItem(lastKey, now.toString());
      })
      .catch(() => {
        // Silent fail - this is a background optimization
      });
    
    lastRecompute.current = now;
  }, []);
}
