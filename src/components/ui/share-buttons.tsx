"use client";

import React, { useState } from "react";
import { Facebook, Link2, MessageSquare, Share2, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareReddit = () => {
    window.open(
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url,
        });
      } catch {
        // User cancelled or error
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={shareTwitter}
        title="Share on X/Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={shareReddit}
        title="Share on Reddit"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={shareFacebook}
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={copyLink}
          title="Copy link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
            Copied!
          </span>
        )}
      </div>
      {/* Native share — only renders on client, feature-detected */}
      <NativeShareButton title={title} description={description} url={url} onShare={nativeShare} />
    </div>
  );
}

function NativeShareButton({
  onShare,
}: {
  title: string;
  description?: string;
  url: string;
  onShare: () => void;
}) {
  const [supportsShare, setSupportsShare] = useState(false);

  // Feature detect on mount using useEffect
  React.useEffect(() => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      if (isMobile) {
        setSupportsShare(true);
      }
    }
  }, []);

  if (!supportsShare) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onShare}
      title="Share"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
