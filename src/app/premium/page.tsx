import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Crown, BookOpen, Sparkles, Shield, Heart, Zap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reader Premium | FictionForge",
  description: "Upgrade to Reader Premium for ad-free reading, exclusive features, and support independent authors.",
};

const benefits = [
  {
    icon: BookOpen,
    title: "Ad-Free Reading",
    description: "Enjoy uninterrupted reading without any advertisements. Just you and the story.",
  },
  {
    icon: Crown,
    title: "Premium Profile Badge",
    description: "Stand out in the community with an exclusive premium crown badge on your profile.",
  },
  {
    icon: Heart,
    title: "Support Authors Directly",
    description: "Your subscription helps fund the platform, keeping it free for everyone while supporting the authors you love.",
  },
  {
    icon: Shield,
    title: "Priority Support",
    description: "Get faster responses when you need help. Premium members are our top priority.",
  },
  {
    icon: Sparkles,
    title: "Exclusive Themes",
    description: "Access premium reading themes designed for comfortable long-form reading sessions.",
    comingSoon: true,
  },
  {
    icon: Zap,
    title: "Early Access",
    description: "Be the first to try new features before they roll out to everyone.",
    comingSoon: true,
  },
];

export default async function PremiumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPremium = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_premium")
      .eq("id", user.id)
      .single();
    isPremium = profile?.is_premium || false;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-sm font-medium mb-4">
          <Crown className="h-4 w-4" />
          Reader Premium
        </div>
        <h1 className="text-4xl font-bold mb-4">
          Your reading experience,{" "}
          <span className="text-yellow-500">elevated</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Support independent authors and enjoy an enhanced reading experience. 
          Premium members help keep the platform free for everyone.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="border rounded-lg p-6 hover:border-primary/30 transition-colors"
          >
            <benefit.icon className="h-8 w-8 text-yellow-500 mb-3" />
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              {benefit.title}
              {benefit.comingSoon && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-normal">
                  COMING SOON
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Simple, transparent pricing</h2>
        <p className="text-muted-foreground">Choose the plan that works for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
        <div className="border rounded-lg p-6 text-center">
          <h3 className="font-semibold mb-2">Monthly</h3>
          <p className="text-4xl font-bold mb-1">
            $3<span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-sm text-muted-foreground mb-6">Cancel anytime</p>
          {isPremium ? (
            <div className="py-2.5 px-4 rounded-md bg-muted text-muted-foreground text-sm font-medium">
              ✓ You&apos;re subscribed
            </div>
          ) : (
            <Link
              href={user ? "/settings/billing" : "/login"}
              className="block py-2.5 px-4 rounded-md border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
            >
              Get Started
            </Link>
          )}
        </div>

        <div className="border-2 border-primary rounded-lg p-6 text-center relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
            BEST VALUE
          </div>
          <h3 className="font-semibold mb-2">Annual</h3>
          <p className="text-4xl font-bold mb-1">
            $30<span className="text-base font-normal text-muted-foreground">/yr</span>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            $2.50/mo — save $6/year
          </p>
          {isPremium ? (
            <div className="py-2.5 px-4 rounded-md bg-muted text-muted-foreground text-sm font-medium">
              ✓ You&apos;re subscribed
            </div>
          ) : (
            <Link
              href={user ? "/settings/billing" : "/login"}
              className="block py-2.5 px-4 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              Get Started — Save $6/year
            </Link>
          )}
        </div>
      </div>

      {/* FAQ / Trust */}
      <div className="border-t pt-8">
        <h3 className="font-semibold text-center mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4 max-w-2xl mx-auto">
          <div>
            <p className="font-medium text-sm">Can I cancel anytime?</p>
            <p className="text-sm text-muted-foreground">
              Yes! Cancel with one click from your billing settings. Your premium benefits continue until the end of your billing period.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm">Where does my money go?</p>
            <p className="text-sm text-muted-foreground">
              Your subscription helps keep the platform running and ad-free. We&apos;re committed to giving 85% of author subscription revenue directly to authors — the best split in web fiction.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm">Is free reading going away?</p>
            <p className="text-sm text-muted-foreground">
              Never. All stories remain free to read. Premium is for readers who want an enhanced experience and want to support the community.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm">What payment methods do you accept?</p>
            <p className="text-sm text-muted-foreground">
              We accept all major credit and debit cards through Stripe, our secure payment processor.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
