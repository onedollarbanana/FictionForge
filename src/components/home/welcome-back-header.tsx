import { createClient } from '@/lib/supabase/server';

export async function WelcomeBackHeader({ userId }: { userId: string }) {
  const supabase = await createClient();

  const [{ data: profile }, { count: libraryCount }, { count: chaptersThisWeek }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', userId)
      .single(),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('chapter_reads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('read_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const name = profile?.display_name || profile?.username || 'reader';

  const stats: string[] = [];
  if (libraryCount && libraryCount > 0) {
    stats.push(`${libraryCount} ${libraryCount === 1 ? 'story' : 'stories'} in library`);
  }
  if (chaptersThisWeek && chaptersThisWeek > 0) {
    stats.push(`${chaptersThisWeek} ${chaptersThisWeek === 1 ? 'chapter' : 'chapters'} this week`);
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">Welcome back, {name}</h1>
      {stats.length > 0 && (
        <p className="text-sm text-muted-foreground mt-1">{stats.join(' · ')}</p>
      )}
    </div>
  );
}
