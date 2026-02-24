import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SignupCtaProps {
  variant?: "story" | "browse";
}

export function SignupCta({ variant = "story" }: SignupCtaProps) {
  if (variant === "browse") {
    return (
      <Card className="mb-6 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
        <CardContent className="py-6 text-center">
          <BookOpen className="h-8 w-8 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold mb-2">
            Join Fictionry for free
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
            Sign up to save your favorites, track your reading progress, and get
            personalized recommendations.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
              <Link href="/signup">Sign Up Free</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Story page variant
  return (
    <Card className="mt-6 border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
      <CardContent className="py-5 text-center">
        <p className="font-medium mb-1">Enjoying this story?</p>
        <p className="text-sm text-muted-foreground mb-4">
          Sign up to bookmark this story, track your reading progress, and more.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
            <Link href="/signup">Sign Up Free</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
