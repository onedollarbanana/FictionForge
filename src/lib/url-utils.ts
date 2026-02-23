/**
 * URL utilities for SEO-friendly story and chapter URLs.
 *
 * Story URL format:  /story/{slug}-{shortId}
 * Chapter URL format: /story/{slug}-{shortId}/chapter/{chapterSlug}-{chapterShortId}
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
  slug?: string | null;
  short_id: string;
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
    return `${storyBase}/chapter/${chapter.slug}-${chapter.short_id}`;
  }
  return `${storyBase}/chapter/${chapter.short_id}`;
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
 * Parse a chapter URL param (e.g., "the-awakening-abc1234") into its parts.
 * The shortId is the last segment after the final hyphen (same as parseStoryParam).
 */
export function parseChapterParam(param: string): { slug: string; shortId: string } | null {
  const lastDash = param.lastIndexOf('-');
  if (lastDash === -1 || lastDash === param.length - 1) return null;

  const slug = param.substring(0, lastDash);
  const shortId = param.substring(lastDash + 1);

  // shortId should be ~7 chars
  if (shortId.length < 4 || shortId.length > 12) return null;
  if (!slug) return null;

  return { slug, shortId };
}
