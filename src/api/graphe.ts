'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type NoeudGraphe = components['schemas']['NoeudGrapheDto'];
export type AreteGraphe = components['schemas']['AreteGrapheDto'];
export type Voisinage = components['schemas']['VoisinageDto'];
export type Chemins = components['schemas']['CheminsDto'];
export type Chemin = components['schemas']['CheminDto'];

export const CLE_GRAPHE = ['graphe'] as const;

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

export function useVueEntiere(options: {
  fiabilite: number;
  dossierId?: string;
}) {
  return useQuery({
    queryKey: [...CLE_GRAPHE, 'complet', options],

    staleTime: 60_000,
    queryFn: () =>
      attendre(
        api.GET('/graphe/complet', {
          params: {
            query: {
              fiabilite: options.fiabilite,
              dossier: options.dossierId,
            },
          },
        }),
        'graphe indisponible',
      ),
  });
}

export function useVoisinage(options: {
  depuis: string | null;
  profondeur: number;
  fiabilite: number;
  dossierId?: string;
}) {
  return useQuery({
    queryKey: [...CLE_GRAPHE, 'voisinage', options],
    enabled: options.depuis !== null,
    queryFn: () =>
      attendre(
        api.GET('/graphe', {
          params: {
            query: {
              depuis: options.depuis!,
              profondeur: options.profondeur,
              fiabilite: options.fiabilite,
              dossier: options.dossierId,
            },
          },
        }),
        'graphe indisponible',
      ),
  });
}

export function useChemins(
  de: string | null,
  vers: string | null,
  fiabilite: number,
) {
  return useQuery({
    queryKey: [...CLE_GRAPHE, 'chemin', de, vers, fiabilite],
    enabled: de !== null && vers !== null && de !== vers,
    queryFn: () =>
      attendre(
        api.GET('/graphe/chemin', {
          params: { query: { de: de!, vers: vers!, fiabilite } },
        }),
        'recherche de chemin indisponible',
      ),
  });
}

export function useEnregistrerPositions() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (disposition: {
      dossierId?: string;
      positions: { entiteId: string; x: number; y: number }[];
    }) =>
      attendre(
        api.POST('/graphe/positions', { body: disposition }),
        'disposition non enregistrée',
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_GRAPHE }),
  });
}
