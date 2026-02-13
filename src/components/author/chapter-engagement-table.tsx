'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronUp, ChevronDown, Eye, Heart, MessageSquare, FileText, ArrowUpDown } from 'lucide-react'

interface ChapterEngagement {
  id: string
  story_id: string
  story_title: string
  chapter_number: number
  title: string
  views: number
  likes: number
  comment_count: number
  word_count: number
  published_at: string | null
}

type SortField = 'chapter_number' | 'views' | 'likes' | 'comment_count' | 'word_count' | 'published_at'
type SortDirection = 'asc' | 'desc'

interface ChapterEngagementTableProps {
  authorId: string
}

export function ChapterEngagementTable({ authorId }: ChapterEngagementTableProps) {
  const [chapters, setChapters] = useState<ChapterEngagement[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('views')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedStory, setSelectedStory] = useState<string>('all')
  const [stories, setStories] = useState<{ id: string; title: string }[]>([])

  useEffect(() => {
    fetchChapterEngagement()
  }, [authorId])

  async function fetchChapterEngagement() {
    const supabase = createClient()
    
    // First get all stories by this author
    const { data: storiesData } = await supabase
      .from('stories')
      .select('id, title')
      .eq('author_id', authorId)
      .order('title')

    if (storiesData) {
      setStories(storiesData)
    }

    // Get all published chapters with their stats
    const { data: chaptersData } = await supabase
      .from('chapters')
      .select(`
        id,
        story_id,
        chapter_number,
        title,
        views,
        likes,
        word_count,
        published_at,
        stories!inner(title, author_id)
      `)
      .eq('stories.author_id', authorId)
      .eq('is_published', true)
      .order('views', { ascending: false })

    if (chaptersData) {
      // Get comment counts for each chapter
      const chapterIds = chaptersData.map(c => c.id)
      
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('chapter_id')
        .in('chapter_id', chapterIds)

      // Count comments per chapter
      const commentCountMap = new Map<string, number>()
      commentCounts?.forEach(c => {
        commentCountMap.set(c.chapter_id, (commentCountMap.get(c.chapter_id) || 0) + 1)
      })

      const engagementData: ChapterEngagement[] = chaptersData.map(chapter => ({
        id: chapter.id,
        story_id: chapter.story_id,
        story_title: (chapter.stories as any).title,
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        views: chapter.views || 0,
        likes: chapter.likes || 0,
        comment_count: commentCountMap.get(chapter.id) || 0,
        word_count: chapter.word_count || 0,
        published_at: chapter.published_at
      }))

      setChapters(engagementData)
    }

    setLoading(false)
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredChapters = selectedStory === 'all' 
    ? chapters 
    : chapters.filter(c => c.story_id === selectedStory)

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    let aVal: number | string = a[sortField] ?? 0
    let bVal: number | string = b[sortField] ?? 0
    
    if (sortField === 'published_at') {
      aVal = a.published_at ? new Date(a.published_at).getTime() : 0
      bVal = b.published_at ? new Date(b.published_at).getTime() : 0
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  function SortHeader({ field, label, icon: Icon }: { field: SortField; label: string; icon?: React.ElementType }) {
    const isActive = sortField === field
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wide hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors ${
          isActive ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {isActive ? (
          sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
        )}
      </button>
    )
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-48"></div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Chapter Performance</h3>
        <p className="text-zinc-500">Publish chapters to see engagement data here.</p>
      </div>
    )
  }

  // Calculate totals and averages for filtered chapters
  const totalViews = filteredChapters.reduce((sum, c) => sum + c.views, 0)
  const avgViews = filteredChapters.length > 0 ? Math.round(totalViews / filteredChapters.length) : 0
  const bestChapter = filteredChapters.length > 0 
    ? filteredChapters.reduce((best, c) => c.views > best.views ? c : best, filteredChapters[0])
    : null

  // Get selected story name for empty state
  const selectedStoryName = stories.find(s => s.id === selectedStory)?.title

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Chapter Performance</h3>
            {filteredChapters.length > 0 && bestChapter ? (
              <p className="text-sm text-zinc-500 mt-1">
                {filteredChapters.length} chapter{filteredChapters.length !== 1 ? 's' : ''} • 
                Avg {avgViews.toLocaleString()} views • 
                Best: Ch. {bestChapter.chapter_number} ({bestChapter.views.toLocaleString()} views)
              </p>
            ) : (
              <p className="text-sm text-zinc-500 mt-1">
                {chapters.length} total chapter{chapters.length !== 1 ? 's' : ''} across all stories
              </p>
            )}
          </div>
          
          {stories.length > 1 && (
            <select
              value={selectedStory}
              onChange={(e) => setSelectedStory(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="all">All Stories</option>
              {stories.map(story => (
                <option key={story.id} value={story.id}>{story.title}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Empty state when filtered story has no chapters */}
      {filteredChapters.length === 0 ? (
        <div className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <p className="text-zinc-500">
            No published chapters in "{selectedStoryName}"
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            Publish chapters to see engagement data here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <SortHeader field="chapter_number" label="Chapter" />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="views" label="Views" icon={Eye} />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="likes" label="Likes" icon={Heart} />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="comment_count" label="Comments" icon={MessageSquare} />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="word_count" label="Words" icon={FileText} />
                  </th>
                  <th className="px-4 py-3 text-right">
                    <SortHeader field="published_at" label="Published" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {sortedChapters.slice(0, 20).map((chapter) => {
                  const isTopPerformer = chapter.views >= avgViews * 1.5
                  const isUnderperforming = chapter.views < avgViews * 0.5 && avgViews > 0
                  
                  return (
                    <tr 
                      key={chapter.id} 
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link 
                          href={`/author/stories/${chapter.story_id}/chapters/${chapter.id}/edit`}
                          className="block"
                        >
                          <div className="flex items-center gap-2">
                            {isTopPerformer && (
                              <span className="w-2 h-2 rounded-full bg-green-500" title="Top performer" />
                            )}
                            {isUnderperforming && (
                              <span className="w-2 h-2 rounded-full bg-amber-500" title="Below average" />
                            )}
                            <div>
                              <p className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400">
                                Ch. {chapter.chapter_number}: {chapter.title}
                              </p>
                              {selectedStory === 'all' && stories.length > 1 && (
                                <p className="text-xs text-zinc-500 truncate max-w-[200px]">{chapter.story_title}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${
                          isTopPerformer ? 'text-green-600 dark:text-green-400' : 
                          isUnderperforming ? 'text-amber-600 dark:text-amber-400' : 
                          'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {chapter.views.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                        {chapter.likes.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-700 dark:text-zinc-300">
                        {chapter.comment_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-500">
                        {chapter.word_count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-500 text-sm">
                        {chapter.published_at ? new Date(chapter.published_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {sortedChapters.length > 20 && (
            <div className="px-4 py-3 text-center text-sm text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
              Showing top 20 of {sortedChapters.length} chapters
            </div>
          )}
        </>
      )}
    </div>
  )
}
