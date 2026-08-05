/**
 * Shared TypeScript types for the whole client.
 *
 * SWAPI returns almost everything as strings (including numbers, because
 * some fields can be "unknown" or "n/a"), so most numeric-looking fields
 * below are typed as `string` on purpose - conversion/validation happens
 * in `utils/formatters.ts`, not at the type level.
 */

/** A single Star Wars character, as returned by GET /people (or /people/:id). */
export interface Person {
  name: string;
  height: string; // centimeters, as a string e.g. "172" | "unknown"
  mass: string; // kg, as a string e.g. "77" | "unknown"
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
  homeworld: string; // URL to a Planet resource
  films: string[]; // URLs to Film resources
  species: string[]; // URLs to Species resources
  vehicles: string[];
  starships: string[];
  created: string; // ISO date string - "date added to the API"
  edited: string;
  url: string; // this character's own URL, used as a stable id
}

/** A Star Wars film, as returned by GET /films/:id */
export interface Film {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  url: string;
}

/** A Star Wars species, as returned by GET /species/:id */
export interface Species {
  name: string;
  classification: string;
  designation: string;
  average_height: string;
  language: string;
  homeworld: string | null;
  people: string[];
  url: string;
}

/** A Star Wars planet, as returned by GET /planets/:id */
export interface Planet {
  name: string;
  climate: string;
  terrain: string;
  population: string; // e.g. "200000" | "unknown"
  residents: string[];
  films: string[];
  url: string;
}

/** Response shape of POST /auth/login and POST /auth/refresh from our backend. */
export interface AuthTokenResponse {
  accessToken: string;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  username: string;
}

/** Everything CharacterList needs to know about the currently open filters. */
export interface CharacterFilters {
  searchText: string;
  homeworldUrl: string; // '' = no filter
  filmUrl: string; // '' = no filter
  speciesUrl: string; // '' = no filter
}

/** A lightweight {url,name} pair used to populate filter <select> options. */
export interface FilterOption {
  url: string;
  label: string;
}
