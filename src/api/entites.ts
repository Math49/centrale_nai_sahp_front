'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type FicheEntite = components['schemas']['FicheEntiteDto'];
export type EntiteResumee = components['schemas']['EntiteResumeeDto'];
export type SuggestionDoublon = components['schemas']['SuggestionDoublonDto'];
export type CreationEntite = components['schemas']['CreationEntiteDto'];
export type CreationFait = components['schemas']['CreationFaitDto'];

export const CLE_ENTITES = ['entites'] as const;

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

export function useEntites(filtres: { typeEntiteId?: string; q?: string }) {
  return useQuery({
    queryKey: [...CLE_ENTITES, 'liste', filtres],
    queryFn: () =>
      attendre(
        api.GET('/entites', {
          params: {
            query: {
              type: filtres.typeEntiteId,
              q: filtres.q || undefined,
            },
          },
        }),
        'annuaire indisponible',
      ),
  });
}

export function useEntite(id: string | null) {
  return useQuery({
    queryKey: [...CLE_ENTITES, id],
    enabled: id !== null,
    queryFn: () =>
      attendre(
        api.GET('/entites/{id}', { params: { path: { id: id! } } }),
        'fiche indisponible',
      ),
  });
}

/**
 * Détection de doublons à la frappe.
 *
 * Interrogée pendant la saisie, pas à l'enregistrement : une fois la fiche
 * créée, il est trop tard pour proposer de retenir l'existante.
 */
export function useSimilaires(q: string, typeEntiteId?: string) {
  const recherche = q.trim();

  return useQuery({
    queryKey: [...CLE_ENTITES, 'similaires', typeEntiteId, recherche],
    enabled: recherche.length >= 2,
    staleTime: 10_000,
    queryFn: () =>
      attendre(
        api.GET('/entites/similaires', {
          params: { query: { q: recherche, type: typeEntiteId } },
        }),
        'recherche de doublons indisponible',
      ),
  });
}

function useEcriture<Variables, Resultat>(
  action: (variables: Variables) => Promise<Resultat>,
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_ENTITES }),
  });
}

export function useCreerEntite() {
  return useEcriture((corps: CreationEntite) =>
    attendre(api.POST('/entites', { body: corps }), 'création impossible'),
  );
}

export function useCreerFait() {
  return useEcriture((corps: CreationFait) =>
    attendre(api.POST('/faits', { body: corps }), 'fait non enregistré'),
  );
}

/**
 * Retrait d'une entité que le sous-formulaire venait de persister.
 *
 * Ce n'est pas une suppression de renseignement : l'enregistrement est
 * progressif, et une cascade abandonnée laisserait sinon des fiches vides.
 */
export function useAnnulerCreation() {
  return useEcriture((id: string) =>
    attendre(
      api.POST('/entites/{id}/annuler-creation', {
        params: { path: { id } },
      }),
      'annulation impossible',
    ),
  );
}
