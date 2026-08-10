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

/**
 * L'accueil arrive **assemblé** : signaux, dossiers de l'agent et dernière
 * activité en une requête.
 *
 * Même raison que pour la fiche — les trois blocs dépendent des mêmes règles de
 * visibilité, et les recomposer ici supposerait que la règle existe en deux
 * exemplaires.
 */
export function useAccueil() {
  return useQuery({
    queryKey: CLE_ACCUEIL,
    queryFn: () => attendre(api.GET('/accueil'), 'accueil indisponible'),
  });
}

/**
 * Recherche globale.
 *
 * Les objets inaccessibles en sont absents, sans mention ni décompte : c'est
 * l'API qui en décide, jamais cet appel.
 */
export function useRecherche(q: string) {
  const recherche = q.trim();

  return useQuery({
    queryKey: [...CLE_RECHERCHE, recherche],
    enabled: recherche.length >= 2,
    // Le résultat d'une frappe ne se garde pas : une recherche relancée doit
    // repartir de l'état courant des habilitations.
    staleTime: 0,
    queryFn: () =>
      attendre(
        api.GET('/recherche', { params: { query: { q: recherche } } }),
        'recherche indisponible',
      ),
  });
}
