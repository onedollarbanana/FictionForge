'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Plus, Trash2, ArrowUp, ArrowDown, Search } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface FeaturedClientProps {
  featured: any[];
  allStories: any[];
}

export function FeaturedClient({ featured, allStories }: FeaturedClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [note, setNote] = useState('');

  const supabase = createClient();

  // Get featured story IDs to exclude from add list
  const featuredIds = new Set(featured.map((f: any) => f.story_id));

  const filteredStories = allStories
    .filter((s: any) => !featuredIds.has(s.id))
    .filter((s: any) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const author = Array.isArray(s.profiles) ? s.profiles[0]?.username : s.profiles?.username;
      return s.title.toLowerCase().includes(q) || (author || '').toLowerCase().includes(q);
    });

  async function addFeatured(storyId: string) {
    setLoading(storyId);
    const maxOrder = featured.reduce((max: number, f: any) => Math.max(max, f.display_order || 0), 0);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('featured_stories').insert({
      story_id: storyId,
      featured_by: user.id,
      display_order: maxOrder + 1,
      note: note || null,
    });
    
    setNote('');
    setLoading(null);
    router.refresh();
  }

  async function removeFeatured(id: string) {
    setLoading(id);
    await supabase.from('featured_stories').delete().eq('id', id);
    setLoading(null);
    router.refresh();
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    setLoading(id);
    const idx = featured.findIndex((f: any) => f.id === id);
    if (idx < 0) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= featured.length) return;

    const currentOrder = featured[idx].display_order;
    const swapOrder = featured[swapIdx].display_order;

    await Promise.all([
      supabase.from('featured_stories').update({ display_order: swapOrder }).eq('id', featured[idx].id),
      supabase.from('featured_stories').update({ display_order: currentOrder }).eq('id', featured[swapIdx].id),
    ]);

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Staff Picks</h2>
          <p className="text-muted-foreground">Manage featured stories shown on the homepage</p>
        </div>
        <Button onClick={() => setShowAddPanel(!showAddPanel)}>
          <Plus className="h-4 w-4 mr-2" />
          {showAddPanel ? 'Close' : 'Add Story'}
        </Button>
      </div>

      {/* Add Story Panel */}
      {showAddPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a Staff Pick</CardTitle>
            <CardDescription>Search for a published story to feature</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-48"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {filteredStories.slice(0, 20).map((story: any) => {
                const author = Array.isArray(story.profiles) ? story.profiles[0]?.username : story.profiles?.username;
                return (
                  <div
                    key={story.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{story.title}</p>
                      <p className="text-xs text-muted-foreground">by @{author || 'unknown'}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addFeatured(story.id)}
                      disabled={loading === story.id}
                    >
                      {loading === story.id ? 'Adding...' : 'Feature'}
                    </Button>
                  </div>
                );
              })}
              {filteredStories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? 'No matching stories found' : 'All published stories are already featured'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Featured List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Current Staff Picks ({featured.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {featured.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No featured stories yet. Click &quot;Add Story&quot; to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {featured.map((item: any, idx: number) => {
                const story = Array.isArray(item.stories) ? item.stories[0] : item.stories;
                const featuredBy = Array.isArray(item.profiles) ? item.profiles[0]?.username : item.profiles?.username;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <span className="text-lg font-bold text-muted-foreground w-8 text-center">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{story?.title || 'Unknown Story'}</p>
                      <p className="text-xs text-muted-foreground">
                        Featured by @{featuredBy || 'unknown'} &bull; {new Date(item.featured_at).toLocaleDateString()}
                        {item.note && ` \u2022 "${item.note}"`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveOrder(item.id, 'up')}
                        disabled={idx === 0 || loading === item.id}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => moveOrder(item.id, 'down')}
                        disabled={idx === featured.length - 1 || loading === item.id}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFeatured(item.id)}
                        disabled={loading === item.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
