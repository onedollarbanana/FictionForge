import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data, error } = await supabase.rpc('compute_user_genre_weights', {
    target_user_id: user.id
  });
  
  if (error) {
    console.error('Error recomputing weights:', error);
    return NextResponse.json({ error: 'Failed to recompute' }, { status: 500 });
  }
  
  return NextResponse.json({ weights: data });
}
