import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Pen, Users, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Where Stories <span className="text-primary">Come Alive</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A modern platform for web fiction. Beautiful reading experience,
          powerful writing tools, and a community that cares.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Start Writing
            </Button>
          </Link>
          <Link href="/browse">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Browse Stories
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why FictionForge?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Pen className="w-8 h-8" />}
              title="Beautiful Editor"
              description="Rich text editing with stat boxes, tables, and clean formatting. No more fighting with your editor."
            />
            <FeatureCard
              icon={<BookOpen className="w-8 h-8" />}
              title="Reader-First Design"
              description="Dark mode, customizable fonts, and a mobile experience that doesn't suck."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Real Feedback"
              description="Chapter likes, sortable comments, and engagement metrics that help you grow."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="Author Announcements"
              description="Post updates without breaking bookmarks. Your readers stay informed."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to forge your story?</h2>
        <p className="text-muted-foreground mb-8">
          Join writers who want better tools and readers who deserve better
          experiences.
        </p>
        <Link href="/signup">
          <Button size="lg">Create Free Account</Button>
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-lg bg-card border">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
