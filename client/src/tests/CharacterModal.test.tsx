import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CharacterList } from '../components/CharacterList';
import type { Person, Planet, Film, Species } from '../types';

// Mock the entire SWAPI layer so this test never touches the real network -
// it's a pure integration test of our own React code.
vi.mock('../api/swapiApi', () => ({
  fetchAllPeople: vi.fn(),
  fetchAllFilms: vi.fn(),
  fetchAllPlanets: vi.fn(),
  fetchAllSpecies: vi.fn(),
  fetchPlanetByUrl: vi.fn(),
  fetchFilmByUrl: vi.fn(),
  fetchSpeciesByUrl: vi.fn(),
}));

import * as swapiApi from '../api/swapiApi';

const LUKE: Person = {
  name: 'Luke Skywalker',
  height: '172',
  mass: '77',
  hair_color: 'blond',
  skin_color: 'fair',
  eye_color: 'blue',
  birth_year: '19BBY',
  gender: 'male',
  homeworld: 'https://swapi.info/api/planets/1',
  films: ['https://swapi.info/api/films/1'],
  species: [],
  vehicles: [],
  starships: [],
  created: '2014-12-09T13:50:51.644000Z',
  edited: '2014-12-20T21:17:56.891000Z',
  url: 'https://swapi.info/api/people/1',
};

const LEIA: Person = {
  ...LUKE,
  name: 'Leia Organa',
  height: '150',
  birth_year: '19BBY',
  url: 'https://swapi.info/api/people/5',
};

const TATOOINE: Planet = {
  name: 'Tatooine',
  climate: 'arid',
  terrain: 'desert',
  population: '200000',
  residents: ['https://swapi.info/api/people/1'],
  films: ['https://swapi.info/api/films/1'],
  url: 'https://swapi.info/api/planets/1',
};

const A_NEW_HOPE: Film = {
  title: 'A New Hope',
  episode_id: 4,
  opening_crawl: '...',
  director: 'George Lucas',
  producer: 'Gary Kurtz',
  release_date: '1977-05-25',
  characters: [LUKE.url, LEIA.url],
  url: 'https://swapi.info/api/films/1',
};

const HUMAN_SPECIES: Species = {
  name: 'Human',
  classification: 'mammal',
  designation: 'sentient',
  average_height: '180',
  language: 'Galactic Basic',
  homeworld: null,
  people: [LUKE.url, LEIA.url],
  url: 'https://swapi.info/api/species/1',
};

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('CharacterList + CharacterModal integration', () => {
  it('opens the modal with the correct character data when a card is clicked', async () => {
    vi.mocked(swapiApi.fetchAllPeople).mockResolvedValue([LUKE, LEIA]);
    vi.mocked(swapiApi.fetchAllFilms).mockResolvedValue([A_NEW_HOPE]);
    vi.mocked(swapiApi.fetchAllPlanets).mockResolvedValue([TATOOINE]);
    vi.mocked(swapiApi.fetchAllSpecies).mockResolvedValue([HUMAN_SPECIES]);
    vi.mocked(swapiApi.fetchPlanetByUrl).mockResolvedValue(TATOOINE);

    renderWithQueryClient(<CharacterList />);

    // Wait for the character grid to render (list fetch resolves).
    const lukeCard = await screen.findByRole('button', { name: /view details for luke skywalker/i });
    expect(lukeCard).toBeInTheDocument();

    // Sanity check: Leia's card is present too, but we only click Luke's.
    expect(screen.getByRole('button', { name: /view details for leia organa/i })).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(lukeCard);

    // Modal should open with Luke's name as the header. Level 2 disambiguates
    // it from the h3 card title, which shares the same accessible name.
    const modalTitle = await screen.findByRole('heading', { name: 'Luke Skywalker', level: 2 });
    expect(modalTitle).toBeInTheDocument();

    // Height converted to meters (172cm -> 1.72 m).
    expect(screen.getByText('1.72 m')).toBeInTheDocument();

    // Birth year shown as-is.
    expect(screen.getByText('19BBY')).toBeInTheDocument();

    // Homeworld data loads lazily and should resolve to Tatooine. Scope the
    // query to the modal dialog since "Tatooine" also appears as an option
    // in the homeworld filter <select> behind it.
    const modal = screen.getByRole('dialog');
    await waitFor(() => {
      expect(within(modal).getByText('Tatooine')).toBeInTheDocument();
    });
    expect(swapiApi.fetchPlanetByUrl).toHaveBeenCalledWith(LUKE.homeworld);

    // Make sure we did NOT accidentally show Leia's data in the modal.
    expect(screen.queryByRole('heading', { name: 'Leia Organa', level: 2 })).not.toBeInTheDocument();
  });
});
