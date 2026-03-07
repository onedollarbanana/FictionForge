import Link from 'next/link';
import { CheckCircle, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  "You own your stories. Full stop. No rights grabs, no predatory contracts.",
  "Earn directly from readers. Set your own tiers, keep the majority of revenue.",
  "Discovery that rewards quality. Your story rises on reader engagement, not upload volume.",
];

export function ForAuthors() {
  return (
    <section className="my-10 bg-muted/50 rounded-2xl px-8 py-10">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-2">Own Your Work. Grow Your Audience.</h2>
        <p className="text-muted-foreground mb-6">
          Fictionry is built for writers who take their craft seriously.
        </p>
        <ul className="space-y-3 mb-8">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        <Link href="/signup">
          <Button>
            <PenTool className="h-4 w-4 mr-2" />
            Start Writing
          </Button>
        </Link>
      </div>
    </section>
  );
}
