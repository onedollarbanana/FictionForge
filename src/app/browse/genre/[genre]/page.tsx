export const revalidate = 60;
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { type StoryCardData } from '@/components/story/story-card';
import { BrowseStoryGrid } from '@/components/story/browse-story-grid';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { GENRES } from '@/lib/constants';
import { GenreTagSort } from '@/components/browse/genre-tag-sort';
import { enrichWithCommunityPicks } from '@/lib/community-picks';
import { getGenreSeo, slugToGenre, genreToSlug } from '@/lib/genre-seo';
import Link from 'next/link';
import type { Metadata } from 'next';

interface GenrePageProps {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateStaticParams() {
  return GENRES.map((genre) => ({
    genre: encodeURIComponent(genre),
  }));
}

export async function generateMetadata({
  params,
}: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  const decodedGenre = slugToGenre(genre);
  const seo = getGenreSeo(decodedGenre);
  const canonicalUrl = `https://www.fictionry.com/browse/genre/${genreToSlug(decodedGenre)}`;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Fictionry',
    },
  };
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { genre } = await params;
  const { sort = 'popular' } = await searchParams;
  const decodedGenre = slugToGenre(genre);
  const supabase = await createClient();

  // Validate genre
  if (!GENRES.includes(decodedGenre)) {
    notFound();
  }

  const seo = getGenreSeo(decodedGenre);

  // Determine sort order
  const orderColumn =
    sort === 'newest'
      ? 'created_at'
      : sort === 'updated'
        ? 'updated_at'
        : 'total_views';

  // Fetch stories in this genre
  const { data: stories, error } = await supabase
    .from('stories')
    .select(
      `
      id,
      title,
      tagline,
      blurb,
      cover_url,
      genres,
      tags,
      status,
      total_views,
      follower_count,
      chapter_count,
      rating_average,
      rating_count,
      created_at,
      updated_at,
      profiles!author_id(
        username,
        display_name
      )
    `
    )
    .eq('visibility', 'published')
    .contains('genres', [decodedGenre])
    .order(orderColumn, { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching genre stories:', error);
  }

  const typedStories = (stories || []) as unknown as StoryCardData[];
  await enrichWithCommunityPicks(typedStories, supabase);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${decodedGenre} Stories`,
    description: seo.metaDescription,
    url: `https://www.fictionry.com/browse/genre/${genreToSlug(decodedGenre)}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Fictionry',
      url: 'https://www.fictionry.com',
    },
    numberOfItems: typedStories.length,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Genres',
          item: 'https://www.fictionry.com/genres',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: decodedGenre,
          item: `https://www.fictionry.com/browse/genre/${genreToSlug(decodedGenre)}`,
        },
      ],
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: 'Genres', href: '/genres' },
          { label: decodedGenre },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{decodedGenre}</h1>
          <p className="text-muted-foreground mt-1">
            {typedStories.length}{' '}
            {typedStories.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
        <GenreTagSort currentSort={sort} />
      </div>

      {/* Genre description for SEO */}
      <div className="mb-8 rounded-lg border bg-card p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl" role="img" aria-label={`${decodedGenre} icon`}>
            {seo.icon}
          </span>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {seo.longDescription.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {typedStories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No stories in {decodedGenre} yet. Be the first to write one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <BrowseStoryGrid stories={typedStories} />
      )}

      {/* Related Genres */}
      {seo.relatedGenres.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Related Genres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seo.relatedGenres.map((relatedGenre) => {
              const relatedSeo = getGenreSeo(relatedGenre);
              return (
                <Link
                  key={relatedGenre}
                  href={`/browse/genre/${genreToSlug(relatedGenre)}`}
                >
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="flex items-center gap-3 py-4">
                      <span className="text-2xl">{relatedSeo.icon}</span>
                      <span className="font-medium">{relatedGenre}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
