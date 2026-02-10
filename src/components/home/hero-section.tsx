"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, PenTool, TrendingUp, Users, Star } from "lucide-react";

interface HeroSectionProps {
  isLoggedIn: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  if (isLoggedIn) {
    // Minimal hero for logged-in users - they see Continue Reading below
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border mb-10">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4" />
            <span>The Modern Platform for Web Fiction</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Discover Your Next{" "}
            <span className="text-primary">Obsession</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Thousands of free stories from talented authors. Beautiful reading experience, 
            powerful writing tools, and a community that loves great fiction.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/browse">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                <BookOpen className="h-5 w-5 mr-2" />
                Start Reading
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                <PenTool className="h-5 w-5 mr-2" />
                Start Writing
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>10,000+ Chapters</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Active Community</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>New Updates Daily</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
