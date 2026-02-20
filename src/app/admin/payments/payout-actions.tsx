'use client';

import { useState } from 'react';

export function HoldButton({ authorId, isHeld }: { authorId: string; isHeld: boolean }) {
  const [held, setHeld] = useState(isHeld);
  const [loading, setLoading] = useState(false);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState('');

  async function toggleHold(applyHold: boolean, holdReason?: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/payout-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id: authorId, hold: applyHold, reason: holdReason }),
      });
      if (res.ok) {
        setHeld(applyHold);
        setShowReasonInput(false);
        setReason('');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update hold');
      }
    } catch {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (held) {
    return (
      <button
        onClick={() => toggleHold(false)}
        disabled={loading}
        className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 disabled:opacity-50"
      >
        {loading ? 'Removing…' : 'Remove Hold'}
      </button>
    );
  }

  if (showReasonInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          placeholder="Hold reason…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="border rounded px-2 py-0.5 text-xs w-32"
        />
        <button
          onClick={() => toggleHold(true, reason)}
          disabled={loading}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
        >
          {loading ? '…' : 'Confirm'}
        </button>
        <button
          onClick={() => { setShowReasonInput(false); setReason(''); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowReasonInput(true)}
      disabled={loading}
      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 disabled:opacity-50"
    >
      Hold
    </button>
  );
}

export function ProcessPayoutButton({ authorId, balanceCents }: { authorId: string; balanceCents: number }) {
  const [loading, setLoading] = useState(false);

  async function processPayout() {
    const amountStr = `$${(balanceCents / 100).toFixed(2)}`;
    if (!confirm(`Process payout of ${amountStr} for this author?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/process-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_id: authorId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Payout processed: $${(data.payout.amount_cents / 100).toFixed(2)}`);
        window.location.reload();
      } else {
        alert(data.error || 'Failed to process payout');
      }
    } catch {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={processPayout}
      disabled={loading}
      className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
    >
      {loading ? 'Processing…' : 'Process Payout'}
    </button>
  );
}
