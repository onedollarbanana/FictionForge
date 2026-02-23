"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface CoverLightboxProps {
  src: string;
  alt: string;
  /** Max display width in the lightbox (default: 800) */
  maxWidth?: number;
  /** Max display height in the lightbox (default: 1200) */
  maxHeight?: number;
}

export function CoverLightbox({
  src,
  alt,
  maxWidth = 800,
  maxHeight = 1200,
}: CoverLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    // Prevent body scroll while lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  return (
    <>
      {/* Clickable cover thumbnail */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        aria-label={`Enlarge cover image for ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 768px) 100vw, 192px"
          priority
        />
      </button>

      {/* Lightbox modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Cover image enlarged"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80" />

          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
            aria-label="Close enlarged image"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Enlarged image */}
          <div
            className="relative z-10 animate-in zoom-in-95 duration-200"
            style={{ maxWidth, maxHeight, width: "100%", height: "auto", aspectRatio: "2/3" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain rounded-lg"
              sizes={`(max-width: ${maxWidth}px) 100vw, ${maxWidth}px`}
              quality={90}
            />
          </div>
        </div>
      )}
    </>
  );
}
