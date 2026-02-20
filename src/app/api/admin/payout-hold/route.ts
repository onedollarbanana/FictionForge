import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { author_id, hold, reason } = await request.json();

    if (!author_id || typeof hold !== 'boolean') {
      return NextResponse.json(
        { error: 'author_id (string) and hold (boolean) are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    const updateData = hold
      ? {
          payout_hold: true,
          hold_reason: reason || null,
          hold_set_by: user.id,
          hold_set_at: new Date().toISOString(),
        }
      : {
          payout_hold: false,
          hold_reason: null,
          hold_set_by: null,
          hold_set_at: null,
        };

    const { data: updated, error: updateError } = await admin
      .from('author_stripe_accounts')
      .update(updateData)
      .eq('author_id', author_id)
      .select()
      .single();

    if (updateError) {
      console.error('Hold update error:', updateError);
      return NextResponse.json({ error: 'Failed to update hold status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, account: updated });
  } catch (error: any) {
    console.error('Payout hold error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
