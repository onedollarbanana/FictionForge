export type StoryStatus = 'ongoing' | 'completed' | 'hiatus' | 'dropped'

export interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  is_author: boolean
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  author_id: string
  title: string
  slug: string
  blurb: string | null
  cover_url: string | null
  status: StoryStatus
  genres: string[]
  tags: string[]
  total_views: number
  total_likes: number
  follower_count: number
  chapter_count: number
  word_count: number
  created_at: string
  updated_at: string
  last_chapter_at: string | null
  // Joined data
  author?: Profile
}

export interface Chapter {
  id: string
  story_id: string
  chapter_number: number
  title: string
  content: Record<string, unknown> // Tiptap JSON
  content_html: string | null
  word_count: number
  is_premium: boolean
  is_published: boolean
  author_note: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Follow {
  id: string
  user_id: string
  story_id: string
  status: 'reading' | 'finished' | 'dropped'
  last_read_chapter: number | null
  created_at: string
  updated_at: string
}

export interface ChapterLike {
  id: string
  user_id: string
  chapter_id: string
  created_at: string
}

export interface ReadingProgress {
  id: string
  user_id: string
  story_id: string
  chapter_id: string
  progress: number
  updated_at: string
}

// Genre options for stories
export const GENRES = [
  'Fantasy',
  'Sci-Fi',
  'LitRPG',
  'Progression',
  'Romance',
  'Horror',
  'Mystery',
  'Thriller',
  'Comedy',
  'Drama',
  'Action',
  'Adventure',
  'Slice of Life',
  'Historical',
  'Isekai',
  'Xianxia',
  'Cultivation',
] as const

export type Genre = typeof GENRES[number]
