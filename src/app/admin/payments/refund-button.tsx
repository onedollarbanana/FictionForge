'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RefundButton({ transactionId, amount }: { transactionId: string; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const formattedAmount = `$${(amount / 100).toFixed(2)}`;

  async function handleRefund() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Refund failed');
        return;
      }
      setShowConfirm(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Refund failed');
    } finally {
      setLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-red-600">Refund {formattedAmount}?</span>
        <button
          onClick={handleRefund}
          disabled={loading}
          className="px-2 py-0.5 text-xs font-medium rounded border border-red-500 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => { setShowConfirm(false); setError(null); }}
          disabled={loading}
          className="px-2 py-0.5 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
        >
          No
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-2 py-0.5 text-xs font-medium rounded border border-red-300 text-red-600 hover:bg-red-50"
    >
      Refund
    </button>
  );
}
