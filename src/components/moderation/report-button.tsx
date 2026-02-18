"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ReportContentType = "story" | "chapter" | "comment" | "rating" | "profile";

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "copyright", label: "Copyright violation" },
  { value: "misinformation", label: "Misinformation" },
  { value: "other", label: "Other" },
] as const;

interface ReportButtonProps {
  contentType: ReportContentType;
  contentId: string;
  contentTitle?: string;
  variant?: "ghost" | "outline" | "secondary";
  size?: "sm" | "default" | "icon";
  className?: string;
}

export function ReportButton({
  contentType,
  contentId,
  contentTitle,
  variant = "ghost",
  size = "sm",
  className,
}: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason");
      return;
    }

    startTransition(async () => {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to report content");
        return;
      }

      const { error: insertError } = await supabase.from("reports").insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason,
        details: details.trim() || null,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("You have already reported this content");
        } else {
          setError("Failed to submit report. Please try again.");
        }
        return;
      }

      setSubmitted(true);
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setReason("");
      setDetails("");
      setSubmitted(false);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={cn("text-muted-foreground hover:text-destructive", className)}>
          <Flag className="h-4 w-4" />
          {size !== "icon" && <span className="ml-1">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Report Submitted
              </DialogTitle>
              <DialogDescription>
                Thank you for helping keep FictionForge safe. Our moderation team will review your report.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Report Content</DialogTitle>
              <DialogDescription>
                {contentTitle
                  ? `Reporting: "${contentTitle.length > 50 ? contentTitle.substring(0, 50) + "..." : contentTitle}"`
                  : `Reporting this ${contentType}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for report *</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_REASONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional details (optional)</Label>
                <Textarea
                  id="details"
                  placeholder="Provide any additional context that might help our moderators..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {details.length}/1000
                </p>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isPending || !reason}
                variant="destructive"
              >
                {isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
