import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>;
}

// Redirect to story overview which shows chapters
export default async function ChaptersPage({ params }: PageProps) {
  const { id } = await params;
  redirect(`/author/stories/${id}`)
}
