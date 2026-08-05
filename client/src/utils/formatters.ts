/**
 * Pure formatting helpers used by the CharacterModal. Kept dependency-free
 * and side-effect-free so they're trivial to unit test.
 */

/** Parses a SWAPI numeric-ish string ("172", "unknown", "n/a") into a number or null. */
function parseSwapiNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Converts SWAPI's height (stored in cm as a string) into a human-readable meters string. */
export function formatHeightInMeters(heightCm: string): string {
  const cm = parseSwapiNumber(heightCm);
  if (cm === null) return 'Unknown';
  return `${(cm / 100).toFixed(2)} m`;
}

/** Formats SWAPI's mass (already in kg) defensively, since it can be "unknown". */
export function formatMassInKg(massKg: string): string {
  const kg = parseSwapiNumber(massKg);
  if (kg === null) return 'Unknown';
  // toLocaleString adds thousands separators for heavier characters (e.g. Jabba).
  return `${kg.toLocaleString()} kg`;
}

/** Formats an ISO date string (SWAPI's `created` field) as dd-MM-yyyy. */
export function formatDateDDMMYYYY(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/** Formats a population count with thousands separators, or "Unknown". */
export function formatPopulation(population: string): string {
  const count = parseSwapiNumber(population);
  if (count === null) return 'Unknown';
  return count.toLocaleString();
}

/** Extracts the numeric id from a SWAPI resource URL, e.g. ".../people/4/" -> "4". */
export function extractIdFromUrl(url: string): string {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? match[1] : url;
}
