import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuspendedPage({
  searchParams,
}: {
  searchParams: { reason?: string; until?: string; type?: string };
}) {
  const reason = searchParams.reason || "Policy violation";
  const until = searchParams.until;
  const type = searchParams.type || "suspension";
  const isBan = type === "ban";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold">
            Account {isBan ? "Banned" : "Suspended"}
          </h1>

          <p className="text-muted-foreground">
            Your account has been {isBan ? "permanently banned" : "temporarily suspended"} for the following reason:
          </p>

          <div className="p-3 rounded-lg bg-muted text-sm">
            {reason}
          </div>

          {!isBan && until && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Suspension ends {formatDistanceToNow(new Date(until), { addSuffix: true })}
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            If you believe this is a mistake, please contact support.
          </p>

          <div className="pt-2">
            <Button variant="outline" asChild>
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
