'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type Signal = components['schemas']['SignalDto'];
export type DossierDeLAgent = components['schemas']['DossierDeLAgentDto'];
export type Activite = components['schemas']['ActiviteDto'];
export type Accueil = components['schemas']['AccueilDto'];
export type ResultatRecherche = components['schemas']['ResultatRechercheDto'];

export const CLE_ACCUEIL = ['accueil'] as const;
export const CLE_RECHERCHE = ['recherche'] as const;

async function attendre<T>(
  appel: Promise<{ data?: T; error?: unknown }>,
  defaut: string,
): Promise<T> {
  const { data, error } = await appel;

  if (error) {
    throw new Error(messageDErreur(error, defaut));
  }

  return data as T;
}

export function useAccueil() {
  return useQuery({
    queryKey: CLE_ACCUEIL,
    queryFn: () => attendre(api.GET('/accueil'), 'accueil indisponible'),
  });
}

export function useRecherche(q: string) {
  const recherche = q.trim();

  return useQuery({
    queryKey: [...CLE_RECHERCHE, recherche],
    enabled: recherche.length >= 2,

    staleTime: 0,
    queryFn: () =>
      attendre(
        api.GET('/recherche', { params: { query: { q: recherche } } }),
        'recherche indisponible',
      ),
  });
}
