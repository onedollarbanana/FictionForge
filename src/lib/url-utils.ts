/**
 * URL utilities for SEO-friendly story and chapter URLs.
 *
 * Story URL format:  /story/{slug}-{shortId}
 * Chapter URL format: /story/{slug}-{shortId}/chapter/{chapterNumber}-{chapterSlug}
 *
 * The shortId (7-char base64-derived identifier) is the source of truth.
 * Slugs are cosmetic — mismatches trigger 301 redirects.
 */

// ---------------------------------------------------------------------------
// URL Generation
// ---------------------------------------------------------------------------

export interface StoryUrlData {
  id: string;
  slug?: string | null;
  short_id?: string | null;
}

export interface ChapterUrlData {
  chapter_number: number;
  slug?: string | null;
}

/**
 * Generate a story URL. Falls back to UUID-based URL if slug/short_id unavailable.
 */
export function getStoryUrl(story: StoryUrlData): string {
  if (story.slug && story.short_id) {
    return `/story/${story.slug}-${story.short_id}`;
  }
  return `/story/${story.id}`;
}

/**
 * Generate a chapter URL within a story.
 */
export function getChapterUrl(story: StoryUrlData, chapter: ChapterUrlData): string {
  const storyBase = getStoryUrl(story);
  if (chapter.slug) {
    return `${storyBase}/chapter/${chapter.chapter_number}-${chapter.slug}`;
  }
  return `${storyBase}/chapter/${chapter.chapter_number}`;
}

/**
 * Generate absolute story URL for metadata/sharing.
 */
export function getAbsoluteStoryUrl(story: StoryUrlData): string {
  return `https://www.fictionry.com${getStoryUrl(story)}`;
}

/**
 * Generate absolute chapter URL for metadata/sharing.
 */
export function getAbsoluteChapterUrl(story: StoryUrlData, chapter: ChapterUrlData): string {
  return `https://www.fictionry.com${getChapterUrl(story, chapter)}`;
}

// ---------------------------------------------------------------------------
// URL Parsing
// ---------------------------------------------------------------------------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Detect if a URL param is a legacy full UUID.
 */
export function isLegacyUuid(param: string): boolean {
  return UUID_REGEX.test(param);
}

/**
 * Parse a story URL param (e.g., "blood-money-abc1234") into its parts.
 * The shortId is the last segment after the final hyphen.
 */
export function parseStoryParam(param: string): { slug: string; shortId: string } | null {
  const lastDash = param.lastIndexOf('-');
  if (lastDash === -1 || lastDash === param.length - 1) return null;

  const slug = param.substring(0, lastDash);
  const shortId = param.substring(lastDash + 1);

  // shortId should be ~7 chars
  if (shortId.length < 4 || shortId.length > 12) return null;
  if (!slug) return null;

  return { slug, shortId };
}

/**
 * Parse a chapter URL param (e.g., "3-the-awakening") into its parts.
 * The chapter number is the first segment before the first hyphen.
 */
export function parseChapterParam(param: string): { chapterNumber: number; slug: string | null } | null {
  // Could be just a number: "3"
  const num = parseInt(param, 10);
  if (isNaN(num) || num < 1) return null;

  const firstDash = param.indexOf('-');
  if (firstDash === -1) {
    return { chapterNumber: num, slug: null };
  }

  const slug = param.substring(firstDash + 1);
  return { chapterNumber: num, slug: slug || null };
}
