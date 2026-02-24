import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  // Verify authorization - accept either admin auth or cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Authorized via cron secret
  } else {
    // Check for admin user
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin (you can customize this check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  try {
    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase.rpc('snapshot_rankings');
    
    if (error) {
      console.error('Snapshot rankings error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: data,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Snapshot rankings exception:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
