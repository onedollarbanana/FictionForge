"use client";

import { useState, useEffect } from "react";
import { Crown, CreditCard, ExternalLink, Check, Loader2 } from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  billing_interval: string;
  amount_cents: number;
  currency: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount_cents: number;
  currency: string;
  description: string | null;
  stripe_receipt_url: string | null;
  created_at: string;
}

export function BillingClient({
  subscription,
  transactions,
}: {
  subscription: Subscription | null;
  transactions: Transaction[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCanceled, setShowCanceled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowSuccess(params.get("success") === "true");
    setShowCanceled(params.get("canceled") === "true");
  }, []);

  const handleSubscribe = async (interval: "monthly" | "annual") => {
    setLoading(interval);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to start checkout" });
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading("manage");
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to open billing portal" });
    } finally {
      setLoading(null);
    }
  };

  const formatAmount = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Billing</h2>
        <p className="text-sm text-muted-foreground">
          Manage your Reader Premium subscription
        </p>
      </div>

      {showSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-400">
            Welcome to Reader Premium! Your subscription is now active.
          </p>
        </div>
      )}

      {showCanceled && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-sm text-yellow-400">
            Checkout was canceled. No charges were made.
          </p>
        </div>
      )}

      {message && (
        <div className={`rounded-lg p-4 text-sm ${
          message.type === "error" 
            ? "bg-red-500/10 border border-red-500/20 text-red-400" 
            : "bg-green-500/10 border border-green-500/20 text-green-400"
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Subscription */}
      {subscription ? (
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold">Reader Premium</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 font-medium">
              {subscription.status === "active" ? "Active" : subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Plan</p>
              <p className="font-medium">
                {formatAmount(subscription.amount_cents, subscription.currency)}/{subscription.billing_interval === "annual" ? "year" : "month"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                {subscription.cancel_at_period_end ? "Expires" : "Renews"}
              </p>
              <p className="font-medium">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>

          {subscription.cancel_at_period_end && (
            <p className="text-sm text-yellow-500 mb-4">
              Your subscription will end on {formatDate(subscription.current_period_end)}. 
              You can resubscribe at any time.
            </p>
          )}

          <button
            onClick={handleManage}
            disabled={loading === "manage"}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent transition-colors disabled:opacity-50"
          >
            {loading === "manage" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Manage Subscription
          </button>
        </div>
      ) : (
        /* Upgrade Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-6 flex flex-col">
            <h3 className="font-semibold mb-1">Monthly</h3>
            <p className="text-3xl font-bold mb-1">
              $3<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">Cancel anytime</p>
            <ul className="text-sm space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Premium badge on profile
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Ad-free reading
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Support the platform
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loading !== null}
              className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "monthly" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              Subscribe Monthly
            </button>
          </div>

          <div className="border-2 border-primary rounded-lg p-6 flex flex-col relative">
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
              SAVE $6/YEAR
            </div>
            <h3 className="font-semibold mb-1">Annual</h3>
            <p className="text-3xl font-bold mb-1">
              $30<span className="text-base font-normal text-muted-foreground">/year</span>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              $2.50/month — best value
            </p>
            <ul className="text-sm space-y-2 mb-6 flex-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Everything in Monthly
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Save $6 per year
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" /> Lower payment fees
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe("annual")}
              disabled={loading !== null}
              className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === "annual" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              Subscribe Annually
            </button>
          </div>
        </div>
      )}

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Payment History</h3>
          <div className="border rounded-lg divide-y">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium">{tx.description || tx.type}</p>
                  <p className="text-muted-foreground">{formatDate(tx.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${
                    tx.status === "succeeded" ? "text-green-500" : 
                    tx.status === "failed" ? "text-red-500" : "text-yellow-500"
                  }`}>
                    {formatAmount(tx.amount_cents, tx.currency)}
                  </span>
                  {tx.stripe_receipt_url && (
                    <a
                      href={tx.stripe_receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
