import { BookOpen, Pen, Users, Sparkles, Heart, Zap } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About - FictionForge',
  description: 'Learn about FictionForge, the modern platform built for web fiction authors and readers.',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 text-4xl font-bold mb-4">
          <BookOpen className="h-10 w-10 text-violet-600" />
          <span>FictionForge</span>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A modern platform where stories come alive. Built by readers, for readers and writers.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          We believe every story deserves to be heard. FictionForge was created to give web fiction 
          authors the tools they need to write, publish, and connect with readers—without the 
          frustrations of outdated platforms.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Whether you're writing LitRPG adventures, epic fantasy sagas, or slice-of-life dramas, 
          FictionForge provides a modern, distraction-free environment where your creativity can flourish.
        </p>
      </section>

      {/* Features grid */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Why FictionForge?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg border bg-card">
            <Pen className="h-8 w-8 text-violet-600 mb-4" />
            <h3 className="font-semibold mb-2">Best-in-Class Editor</h3>
            <p className="text-sm text-muted-foreground">
              A powerful rich text editor with support for LitRPG stat boxes, tables, 
              and custom formatting. Write the way you want.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Users className="h-8 w-8 text-violet-600 mb-4" />
            <h3 className="font-semibold mb-2">Reader Engagement</h3>
            <p className="text-sm text-muted-foreground">
              Chapter likes, comment sorting, @mentions, and reading progress tracking. 
              Build a community around your stories.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Sparkles className="h-8 w-8 text-violet-600 mb-4" />
            <h3 className="font-semibold mb-2">Beautiful Reading Experience</h3>
            <p className="text-sm text-muted-foreground">
              Customizable fonts, themes, and reading widths. Mobile-optimized with 
              swipe navigation and keyboard shortcuts.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card">
            <Zap className="h-8 w-8 text-violet-600 mb-4" />
            <h3 className="font-semibold mb-2">Author Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Track views, followers, and engagement over time. Understand what 
              resonates with your readers.
            </p>
          </div>
        </div>
      </section>

      {/* Built with love */}
      <section className="text-center py-12 px-6 rounded-lg bg-violet-50 dark:bg-violet-950/20">
        <Heart className="h-8 w-8 text-violet-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Built with Love</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          FictionForge is an independent project created by passionate readers and writers 
          who wanted something better. We're constantly improving based on community feedback.
        </p>
      </section>

      {/* Contact */}
      <section className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
        <p className="text-muted-foreground mb-4">
          Have questions, suggestions, or just want to say hi?
        </p>
        <a 
          href="mailto:hello@fictionforge.io" 
          className="text-violet-600 hover:text-violet-700 font-medium"
        >
          hello@fictionforge.io
        </a>
      </section>
    </div>
  )
}
