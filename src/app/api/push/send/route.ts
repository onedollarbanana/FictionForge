import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { notifyFollowers } from '@/lib/push-notifications';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Check for service role key in Authorization header
  const authHeader = request.headers.get('authorization');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let isServiceRole = false;

  if (authHeader === `Bearer ${serviceRoleKey}` && serviceRoleKey) {
    isServiceRole = true;
  }

  let authorId: string | null = null;

  if (!isServiceRole) {
    // Fall back to user authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    authorId = user.id;
  }

  try {
    const { storyId, storyTitle, chapterTitle, chapterNumber, chapterId } =
      await request.json();

    if (!storyId || !storyTitle || !chapterTitle || !chapterNumber || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required fields: storyId, storyTitle, chapterTitle, chapterNumber, chapterId' },
        { status: 400 }
      );
    }

    // If authenticated as user (not service role), verify they own the story
    if (authorId) {
      const adminSupabase = createAdminClient();
      const { data: story } = await adminSupabase
        .from('stories')
        .select('author_id')
        .eq('id', storyId)
        .single();

      if (!story || story.author_id !== authorId) {
        return NextResponse.json(
          { error: 'You can only send notifications for your own stories' },
          { status: 403 }
        );
      }
    }

    const result = await notifyFollowers(
      storyId,
      storyTitle,
      chapterTitle,
      chapterNumber,
      chapterId
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
