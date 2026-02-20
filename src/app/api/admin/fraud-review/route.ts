import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
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

    const { flag_id, status, notes } = await request.json();

    if (!flag_id || !status) {
      return NextResponse.json({ error: 'flag_id and status are required' }, { status: 400 });
    }

    if (!['reviewed', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Status must be "reviewed" or "dismissed"' }, { status: 400 });
    }

    const { data: flag, error: updateError } = await supabase
      .from('fraud_flags')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', flag_id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
    }

    return NextResponse.json({ success: true, flag });
  } catch (error: any) {
    console.error('Fraud review error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
