import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { PLATFORM_CONFIG } from '@/lib/platform-config'

export async function POST() {
  try {
    // Auth check
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Check Stripe Connect account
    const { data: stripeAccount } = await admin
      .from('author_stripe_accounts')
      .select('stripe_account_id, onboarding_complete, payouts_enabled, payout_hold')
      .eq('author_id', user.id)
      .maybeSingle()

    if (!stripeAccount || !stripeAccount.payouts_enabled) {
      return NextResponse.json(
        { error: 'Stripe Connect account is not set up or payouts are not enabled' },
        { status: 400 }
      )
    }

    // Calculate available balance
    const { data: earnedRows } = await admin
      .from('author_revenue')
      .select('net_amount_cents')
      .eq('author_id', user.id)

    const totalEarned = earnedRows?.reduce((s, r) => s + (r.net_amount_cents || 0), 0) ?? 0

    const { data: paidRows } = await admin
      .from('payouts')
      .select('amount')
      .eq('author_id', user.id)
      .eq('status', 'paid')

    const totalPaid = paidRows?.reduce((s, r) => s + (r.amount || 0), 0) ?? 0

    // Also subtract pending payouts to avoid double-requesting
    const { data: pendingRows } = await admin
      .from('payouts')
      .select('amount')
      .eq('author_id', user.id)
      .eq('status', 'pending')

    const totalPending = pendingRows?.reduce((s, r) => s + (r.amount || 0), 0) ?? 0

    const availableBalance = totalEarned - totalPaid - totalPending

    if (availableBalance < PLATFORM_CONFIG.MIN_PAYOUT_CENTS) {
      return NextResponse.json(
        {
          error: `Available balance ($${(availableBalance / 100).toFixed(
            2
          )}) is below the $${(PLATFORM_CONFIG.MIN_PAYOUT_CENTS / 100).toFixed(
            2
          )} minimum payout threshold`,
        },
        { status: 400 }
      )
    }

    // Check if account is on hold
    if (stripeAccount.payout_hold) {
      return NextResponse.json(
        { error: 'Your payouts are currently on hold. Please contact support for more information.' },
        { status: 403 }
      )
    }

    // Create payout record
    // In production, this would call stripe.transfers.create() to the connected account
    const now = new Date().toISOString()

    const { data: payout, error: insertError } = await admin
      .from('payouts')
      .insert({
        author_id: user.id,
        amount: availableBalance,
        status: 'pending',
        stripe_payout_id: null, // Would be set after stripe.transfers.create()
        period_start: null,
        period_end: now,
        created_at: now,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Payout insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create payout request' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      payout: {
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
      },
    })
  } catch (error) {
    console.error('Request payout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
