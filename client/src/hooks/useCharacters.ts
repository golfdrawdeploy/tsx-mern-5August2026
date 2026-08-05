import { useQuery } from '@tanstack/react-query';
import {
  fetchAllFilms,
  fetchAllPeople,
  fetchAllPlanets,
  fetchAllSpecies,
  fetchPlanetByUrl,
} from '../api/swapiApi';

/**
 * Fetches every character exactly once per session (long staleTime), since
 * SWAPI's dataset is effectively static and re-fetching the whole array on
 * every render/interaction would be wasteful. `enabled` lets callers defer
 * this until the user is authenticated.
 */
export function useCharacters(enabled: boolean) {
  return useQuery({
    queryKey: ['people'],
    queryFn: fetchAllPeople,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

/** Populates the "Film" filter dropdown. */
export function useFilms(enabled: boolean) {
  return useQuery({
    queryKey: ['films'],
    queryFn: fetchAllFilms,
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/** Populates the "Species" filter dropdown (and could be reused to precompute card colors). */
export function useAllSpecies(enabled: boolean) {
  return useQuery({
    queryKey: ['species'],
    queryFn: fetchAllSpecies,
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/** Populates the "Homeworld" filter dropdown. */
export function usePlanets(enabled: boolean) {
  return useQuery({
    queryKey: ['planets'],
    queryFn: fetchAllPlanets,
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Lazily fetches ONE planet - used by CharacterModal, only fires once a
 * modal is actually opened for a character (enabled=false until then), so
 * we don't fetch homeworld data for characters nobody clicked on.
 */
export function useHomeworld(planetUrl: string | null) {
  return useQuery({
    queryKey: ['planet', planetUrl],
    queryFn: () => fetchPlanetByUrl(planetUrl as string),
    enabled: Boolean(planetUrl),
    staleTime: 10 * 60 * 1000,
  });
}
