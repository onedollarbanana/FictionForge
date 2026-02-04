import { redirect } from 'next/navigation'

// Redirect to story overview which shows chapters
export default function ChaptersPage({
  params,
}: {
  params: { id: string }
}) {
  redirect(`/author/stories/${params.id}`)
}
