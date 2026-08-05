/**
 * Deterministically maps a species name to one of the `--gradient-species-*`
 * CSS custom properties defined in index.css, so the same species always
 * renders the same glass tint, run after run, without a random number
 * generator and without any hardcoded color values living in components.
 */

// Token suffixes only — components read `var(--gradient-species-{suffix})`.
const SPECIES_TOKENS: string[] = [
  'human',
  'droid',
  'wookiee',
  'rodian',
  'hutt',
  'twilek',
  'zabrak',
  'mirialan',
];

/** Neutral fallback token for characters with no species listed ("unknown", droids w/o species, etc). */
export const DEFAULT_SPECIES_TOKEN = 'neutral';

/**
 * djb2-style string hash. Cheap, deterministic, good-enough distribution
 * for mapping a small palette of tokens across an arbitrary set of species names.
 */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  // Force unsigned 32-bit so the result is always a positive index.
  return hash >>> 0;
}

/**
 * Given a species name (or undefined/empty for "no species"), returns the
 * `--gradient-species-*` token suffix to use for that species' card tint.
 */
export function speciesGradientToken(speciesName: string | undefined | null): string {
  if (!speciesName || speciesName.trim().length === 0 || speciesName.toLowerCase() === 'unknown') {
    return DEFAULT_SPECIES_TOKEN;
  }
  const index = hashString(speciesName.toLowerCase()) % SPECIES_TOKENS.length;
  return SPECIES_TOKENS[index];
}
