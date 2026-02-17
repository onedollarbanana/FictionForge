"use client";

import { cn } from "@/lib/utils";

export interface ProfileBorderData {
  id: string;
  name: string;
  description: string | null;
  cssClass: string;
  unlockType: string;
  unlockValue: string | null;
  rarity: string;
  sortOrder: number;
}

interface ProfileBorderProps {
  border: ProfileBorderData | null;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

// Size mappings for the border container
const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16", 
  lg: "w-24 h-24",
  xl: "w-32 h-32",
};

// Border thickness based on size
const borderThickness = {
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
};

// Get border styles based on css_class
function getBorderStyles(cssClass: string, thickness: number): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "relative",
    borderRadius: "50%",
  };

  switch (cssClass) {
    case "border-default":
      return {
        ...base,
        border: `${thickness}px solid hsl(var(--muted))`,
      };
    case "border-bronze":
      return {
        ...base,
        border: `${thickness}px solid #cd7f32`,
        boxShadow: "0 0 8px rgba(205, 127, 50, 0.4)",
      };
    case "border-silver":
      return {
        ...base,
        border: `${thickness}px solid #c0c0c0`,
        boxShadow: "0 0 10px rgba(192, 192, 192, 0.5)",
      };
    case "border-gold":
      return {
        ...base,
        border: `${thickness}px solid #ffd700`,
        boxShadow: "0 0 12px rgba(255, 215, 0, 0.6)",
      };
    case "border-platinum":
      return {
        ...base,
        border: `${thickness}px solid #e5e4e2`,
        boxShadow: "0 0 15px rgba(229, 228, 226, 0.7), inset 0 0 5px rgba(255, 255, 255, 0.3)",
      };
    case "border-legendary":
      return {
        ...base,
        border: `${thickness}px solid transparent`,
        backgroundImage: "linear-gradient(hsl(var(--background)), hsl(var(--background))), linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #ff6b6b)",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        boxShadow: "0 0 20px rgba(255, 107, 107, 0.5)",
      };
    case "border-reader":
      return {
        ...base,
        border: `${thickness}px solid #3b82f6`,
        boxShadow: "0 0 8px rgba(59, 130, 246, 0.4)",
      };
    case "border-critic":
      return {
        ...base,
        border: `${thickness}px solid #8b5cf6`,
        boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
      };
    case "border-author":
      return {
        ...base,
        border: `${thickness}px solid #10b981`,
        boxShadow: "0 0 12px rgba(16, 185, 129, 0.5)",
      };
    default:
      return {
        ...base,
        border: `${thickness}px solid hsl(var(--border))`,
      };
  }
}

// Get rarity color for badges
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "text-muted-foreground";
    case "uncommon":
      return "text-green-500";
    case "rare":
      return "text-blue-500";
    case "epic":
      return "text-purple-500";
    case "legendary":
      return "text-yellow-500";
    default:
      return "text-muted-foreground";
  }
}

export function ProfileBorder({ border, size = "lg", children }: ProfileBorderProps) {
  const thickness = borderThickness[size];
  const borderStyles = border ? getBorderStyles(border.cssClass, thickness) : {};

  return (
    <div
      className={cn(sizeClasses[size], "flex items-center justify-center overflow-hidden")}
      style={borderStyles}
    >
      {children}
    </div>
  );
}
