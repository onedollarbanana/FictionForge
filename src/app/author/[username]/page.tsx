import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { User, BookOpen, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch author profile
  const { data: author, error: authorError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (authorError || !author) {
    notFound();
  }

  // Fetch author's published stories
  const { data: stories } = await supabase
    .from("stories")
    .select(`
      id,
      title,
      slug,
      blurb,
      cover_url,
      status,
      genres,
      total_word_count,
      follower_count,
      updated_at,
      created_at
    `)
    .eq("author_id", author.id)
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  const publishedStories = stories || [];
  const totalWords = publishedStories.reduce((sum, s) => sum + (s.total_word_count || 0), 0);
  const totalFollowers = publishedStories.reduce((sum, s) => sum + (s.follower_count || 0), 0);
  const memberSince = new Date(author.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Author Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
        {/* Avatar */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {author.avatar_url ? (
            <Image
              src={author.avatar_url}
              alt={author.display_name || author.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
              <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {author.display_name || author.username}
          </h1>
          {author.display_name && (
            <p className="text-gray-500">@{author.username}</p>
          )}
          {author.bio && (
            <p className="mt-2 text-gray-700 whitespace-pre-wrap">{author.bio}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Member since {memberSince}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {publishedStories.length} {publishedStories.length === 1 ? "story" : "stories"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{publishedStories.length}</p>
          <p className="text-sm text-gray-600">Stories</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{totalWords.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Words</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-indigo-600">{totalFollowers.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Followers</p>
        </div>
      </div>

      {/* Stories List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Stories by {author.display_name || author.username}</h2>
        
        {publishedStories.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No published stories yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publishedStories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="flex gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Cover */}
                <div className="relative w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                  {story.cover_url ? (
                    <Image
                      src={story.cover_url}
                      alt={story.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-white/80" />
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{story.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {story.genres?.slice(0, 3).map((genre: string) => (
                      <span
                        key={genre}
                        className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded"
                      >
                        {genre}
                      </span>
                    ))}
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      story.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : story.status === "hiatus"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {story.status}
                    </span>
                  </div>
                  {story.blurb && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{story.blurb}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    {(story.total_word_count || 0).toLocaleString()} words · {(story.follower_count || 0).toLocaleString()} followers
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
