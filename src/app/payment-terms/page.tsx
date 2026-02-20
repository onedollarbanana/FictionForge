import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Terms & Refund Policy - FictionForge',
  description: 'Payment terms, refund policy, and subscription information.',
}

export default function PaymentTermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Payment Terms & Refund Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: February 2025</p>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Billing & Payments</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All payments on FictionForge are processed securely through Stripe. We offer the
            following subscription options:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Reader Premium:</strong> $3/month or $30/year</li>
            <li><strong>Author Subscriptions:</strong> Fixed tiers at $3, $6, or $12/month</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            All subscriptions auto-renew unless canceled. You can cancel anytime — your access
            continues until the end of your current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">2. Refund Policy</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We want you to be satisfied with your experience on FictionForge. Here are our
            refund guidelines:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              <strong>Reader Premium:</strong> Refunds may be issued within 7 days of initial
              purchase if you haven&apos;t used premium features significantly
            </li>
            <li>
              <strong>Author Subscriptions:</strong> Refunds may be issued within 48 hours of
              initial subscription if no advance chapters were accessed
            </li>
            <li>No refunds for partial billing periods after cancellation</li>
            <li>Refund requests can be submitted through our support system</li>
            <li>
              Refunds are processed back to the original payment method within 5–10 business days
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">3. Author Payout Terms</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            FictionForge empowers authors to earn from their work. Here&apos;s how payouts work:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Authors receive 85% of subscription revenue (platform retains 15%)</li>
            <li>Minimum payout threshold: $20</li>
            <li>Payouts are processed via Stripe Connect to your connected bank account</li>
            <li>Authors must complete Stripe identity verification to receive payouts</li>
            <li>
              The platform reserves the right to hold payouts pending investigation of
              suspicious activity
            </li>
            <li>Revenue is calculated after Stripe processing fees are deducted</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">4. Subscription Management</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You have full control over your subscriptions:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>Manage your subscriptions from Settings &gt; Billing</li>
            <li>Cancel anytime without penalty</li>
            <li>
              Switching from monthly to annual billing: prorated credit applied
            </li>
            <li>
              Downgrading or canceling author subscriptions: access to advance chapters ends
              when your current period expires
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">5. Disputes & Chargebacks</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            If you have concerns about a charge:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              If you believe a charge was made in error, contact our support team first
            </li>
            <li>Unauthorized charges should be reported within 60 days</li>
            <li>
              Filing a chargeback with your bank without contacting us first may result in
              account suspension
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">6. Changes to Pricing</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We reserve the right to change subscription pricing with 30 days notice.
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              Existing subscribers will be grandfathered at their current rate for at least
              90 days after any price change
            </li>
            <li>You&apos;ll be notified by email of any pricing changes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">7. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about payments, refunds, or these terms, please contact us at{' '}
            <a href="mailto:legal@fictionforge.io" className="text-violet-600 hover:text-violet-700">
              legal@fictionforge.io
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
