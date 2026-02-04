import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold tracking-tight mb-6">
            Where Stories Come to Life
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            The modern platform for web fiction authors. Beautiful formatting,
            engaged readers, and the tools you need to tell your story.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Start Writing</Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline">
                Browse Stories
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-2">Rich Text Editor</h3>
            <p className="text-muted-foreground">
              Format your chapters with ease. Support for LitRPG stat boxes,
              tables, and custom styling.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-2">Reader Engagement</h3>
            <p className="text-muted-foreground">
              Chapter likes, paragraph comments, and reading lists that
              actually work.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-semibold mb-2">Author Analytics</h3>
            <p className="text-muted-foreground">
              Understand your audience with detailed stats on views, retention,
              and engagement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
