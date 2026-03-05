// ─────────────────────────────────────────────────────────────────────────────
// Content Warnings — Taxonomy v3
// Grouped into 3 categories. Warnings support reader safety, not moral judgment.
// ─────────────────────────────────────────────────────────────────────────────

export type ContentWarningItem = {
  value: string
  label: string
}

export type ContentWarningGroup = {
  name: string
  warnings: ContentWarningItem[]
}

export const CONTENT_WARNING_GROUPS: ContentWarningGroup[] = [
  {
    name: 'Violence & Physical Safety',
    warnings: [
      { value: 'violence', label: 'Violence' },
      { value: 'gore_body_horror', label: 'Gore / Body Horror' },
      { value: 'death_major_character', label: 'Death of Major Character' },
      { value: 'child_endangerment', label: 'Child Endangerment' },
      { value: 'animal_harm', label: 'Animal Harm' },
      { value: 'torture_extreme_violence', label: 'Torture / Extreme Violence' },
      { value: 'genocide_mass_violence', label: 'Genocide / Mass Violence' },
      { value: 'kidnapping_captivity', label: 'Kidnapping / Captivity' },
    ],
  },
  {
    name: 'Sexual Content',
    warnings: [
      { value: 'sexual_content_explicit', label: 'Sexual Content (Explicit)' },
      { value: 'sexual_content_fade_to_black', label: 'Sexual Content (Fade to Black)' },
      { value: 'non_consensual_scenarios', label: 'Non-Consensual Scenarios' },
      { value: 'dubious_consent', label: 'Dubious Consent' },
      { value: 'age_gap_sexual', label: 'Age Gap (Sexual)' },
    ],
  },
  {
    name: 'Themes & Emotional Content',
    warnings: [
      { value: 'self_harm_suicide', label: 'Self-Harm / Suicide' },
      { value: 'abuse_physical_emotional_sexual', label: 'Abuse (Physical, Emotional, or Sexual)' },
      { value: 'substance_use_addiction', label: 'Substance Use / Addiction' },
      { value: 'mental_health_themes', label: 'Mental Health Themes' },
      { value: 'eating_disorders', label: 'Eating Disorders' },
      { value: 'profanity_heavy', label: 'Profanity (Heavy)' },
      { value: 'religious_spiritual_content', label: 'Religious / Spiritual Content' },
      { value: 'slavery_depicted', label: 'Slavery (Depicted)' },
      { value: 'racism_discrimination', label: 'Racism / Discrimination (Depicted)' },
      { value: 'gaslighting_manipulation', label: 'Gaslighting / Manipulation' },
      { value: 'infidelity', label: 'Infidelity' },
      { value: 'pregnancy_loss_miscarriage', label: 'Pregnancy Loss / Miscarriage' },
      { value: 'parental_death', label: 'Parental Death' },
      { value: 'body_dysmorphia', label: 'Body Dysmorphia' },
      { value: 'stalking', label: 'Stalking' },
    ],
  },
]

// Flat list for easy lookup and validation
export const CONTENT_WARNINGS = CONTENT_WARNING_GROUPS.flatMap(g => g.warnings)

export type ContentWarning = typeof CONTENT_WARNINGS[number]['value']

// Warnings that require at minimum a 'mature' content rating
export const MATURE_REQUIRED_WARNINGS = [
  'sexual_content_fade_to_black',
  'non_consensual_scenarios',
  'dubious_consent',
  'age_gap_sexual',
  'torture_extreme_violence',
  'genocide_mass_violence',
] as const

// Warnings that require 'adult_18' content rating
export const ADULT_REQUIRED_WARNINGS = [
  'sexual_content_explicit',
] as const

export type ContentRatingValue = 'everyone' | 'teen' | 'mature' | 'adult_18'

export function getMinimumRatingForWarnings(warnings: string[]): ContentRatingValue {
  if (warnings.some(w => (ADULT_REQUIRED_WARNINGS as readonly string[]).includes(w))) {
    return 'adult_18'
  }
  if (warnings.some(w => (MATURE_REQUIRED_WARNINGS as readonly string[]).includes(w))) {
    return 'mature'
  }
  return 'everyone'
}

export function hasMatureContent(rating: string | null | undefined): boolean {
  return rating === 'mature' || rating === 'adult_18'
}

export function hasAdultContent(rating: string | null | undefined): boolean {
  return rating === 'adult_18'
}
