export const CONTENT_WARNINGS = [
  { value: "violence", label: "Violence" },
  { value: "gore", label: "Gore / Graphic Violence" },
  { value: "sexual_content", label: "Sexual Content" },
  { value: "strong_language", label: "Strong Language" },
  { value: "substance_abuse", label: "Substance Abuse" },
  { value: "self_harm", label: "Self-Harm / Suicide" },
  { value: "abuse", label: "Abuse / Trauma" },
  { value: "death", label: "Death" },
  { value: "horror", label: "Horror / Disturbing Content" },
] as const;

export type ContentWarning = typeof CONTENT_WARNINGS[number]["value"];

// Warnings that trigger the mature content gate
export const MATURE_WARNINGS = ["sexual_content", "gore"] as const;

export function hasMatureContent(warnings: string[]): boolean {
  return warnings.some(w => (MATURE_WARNINGS as readonly string[]).includes(w));
}
