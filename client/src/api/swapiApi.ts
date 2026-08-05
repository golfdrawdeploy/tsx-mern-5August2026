import type { Film, Person, Planet, Species } from '../types';

const SWAPI_BASE_URL = import.meta.env.VITE_SWAPI_BASE_URL ?? 'https://swapi.info/api';

/**
 * Small fetch wrapper shared by every SWAPI call below. Throws a
 * descriptive Error on non-2xx responses so React Query's `isError` /
 * `error` states are meaningful instead of a generic "fetch failed".
 */
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`SWAPI request failed (${response.status}) for ${url}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetches every character in a single request. SWAPI (swapi.info) has no
 * server-side pagination, so this really does return the full array -
 * pagination is applied client-side in CharacterList.
 */
export function fetchAllPeople(): Promise<Person[]> {
  return getJson<Person[]>(`${SWAPI_BASE_URL}/people`);
}

/** Fetches one film by its full resource URL (URLs come straight from a Person's `films` array). */
export function fetchFilmByUrl(url: string): Promise<Film> {
  return getJson<Film>(url);
}

/** Fetches every film - used to populate the "Film" filter dropdown options. */
export function fetchAllFilms(): Promise<Film[]> {
  return getJson<Film[]>(`${SWAPI_BASE_URL}/films`);
}

/** Fetches one species by its full resource URL. */
export function fetchSpeciesByUrl(url: string): Promise<Species> {
  return getJson<Species>(url);
}

/** Fetches every species - used to populate the "Species" filter dropdown and card colors. */
export function fetchAllSpecies(): Promise<Species[]> {
  return getJson<Species[]>(`${SWAPI_BASE_URL}/species`);
}

/** Fetches one planet (a character's homeworld) by its full resource URL. */
export function fetchPlanetByUrl(url: string): Promise<Planet> {
  return getJson<Planet>(url);
}

/** Fetches every planet - used to populate the "Homeworld" filter dropdown. */
export function fetchAllPlanets(): Promise<Planet[]> {
  return getJson<Planet[]>(`${SWAPI_BASE_URL}/planets`);
}
