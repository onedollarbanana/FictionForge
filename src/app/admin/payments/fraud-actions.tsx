'use client';

import { useState } from 'react';

export function ScanButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleScan() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/fraud-scan', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setResult(`Scan complete: ${data.new_flags} new flag${data.new_flags === 1 ? '' : 's'} found`);
        // Reload page to show new flags
        if (data.new_flags > 0) {
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult('Scan failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleScan}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? 'Scanning...' : '🔍 Run Fraud Scan'}
      </button>
      {result && (
        <span className="text-sm text-muted-foreground">{result}</span>
      )}
    </div>
  );
}

export function ReviewButton({ flagId, currentStatus }: { flagId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  async function handleReview(status: 'reviewed' | 'dismissed') {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fraud-review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag_id: flagId, status, notes: notes || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error('Review failed:', err);
    } finally {
      setLoading(false);
    }
  }

  if (currentStatus !== 'open') {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {showNotes ? (
        <div className="flex flex-col gap-1">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="text-xs border rounded px-2 py-1 w-40"
          />
          <div className="flex gap-1">
            <button
              onClick={() => handleReview('reviewed')}
              disabled={loading}
              className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
            >
              ✓ Reviewed
            </button>
            <button
              onClick={() => handleReview('dismissed')}
              disabled={loading}
              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNotes(true)}
          className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          Review
        </button>
      )}
    </div>
  );
}
