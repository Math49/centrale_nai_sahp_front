'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type Referentiel = components['schemas']['ReferentielDto'];
export type TypeEntite = components['schemas']['TypeEntiteDto'];
export type DefinitionChamp = components['schemas']['DefinitionChampDto'];
export type TypeLien = components['schemas']['TypeLienDto'];
export type Onglet = components['schemas']['OngletDto'];
export type SensLien = components['schemas']['OngletTypeLienDto']['sens'];
export type TypeDonnee = DefinitionChamp['typeDonnee'];

export const CLE_REFERENTIEL = ['referentiel'] as const;

/** Libellés des types de données, pour les écrans d'administration. */
export const LIBELLES_TYPES_DONNEES: Record<TypeDonnee, string> = {
  texte: 'Texte',
  nombre: 'Nombre',
  date: 'Date',
  datetime: 'Date et heure',
  booleen: 'Oui / non',
  liste: 'Liste fermée',
  fichier: 'Fichier',
};

export interface CandidatOnglet {
  lien: TypeLien;
  sens: SensLien;
  /** Le libellé tel qu'il se lira depuis la fiche, une fois dans l'onglet. */
  libelleLu: string;
}

/**
 * Types de liens qu'un onglet de ce type d'entité peut regrouper.
 *
 * Un onglet n'affiche un lien que du côté où son type d'entité se trouve :
 * l'onglet Membres du groupe montre le côté **inverse** de « membre de », qui
 * va de la personne vers le groupe. Un lien dont les deux extrémités sont du
 * même type apparaît donc deux fois, une par sens.
 *
 * Proposer autre chose reviendrait à proposer une composition que l'API
 * refusera — la règle est la même des deux côtés, mais c'est l'API qui tranche.
 */
export function liensDisponiblesPour(
  type: TypeEntite,
  liens: TypeLien[],
): CandidatOnglet[] {
  const candidats: CandidatOnglet[] = [];

  for (const lien of liens) {
    if (lien.typeEntiteSourceId === type.id) {
      candidats.push({ lien, sens: 'direct', libelleLu: lien.libelle });
    }

    if (lien.typeEntiteCibleId === type.id) {
      candidats.push({ lien, sens: 'inverse', libelleLu: lien.libelleInverse });
    }
  }

  return candidats;
}

/**
 * Le référentiel change rarement et sert à peu près tout l'écran : cache de
 * longue durée, invalidé uniquement par l'administration.
 */
export function useReferentiel() {
  return useQuery({
    queryKey: CLE_REFERENTIEL,
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Referentiel> => {
      const { data, error } = await api.GET('/referentiel');

      if (error || !data) {
        throw new Error(messageDErreur(error, 'référentiel indisponible'));
      }

      return data;
    },
  });
}

/**
 * Toute écriture du référentiel invalide le cache : c'est le seul moment où il
 * bouge, et la fiche de chaque entité en dépend.
 */
function useEcritureReferentiel<Variables, Resultat>(
  action: (variables: Variables) => Promise<Resultat>,
): UseMutationResult<Resultat, Error, Variables> {
  const client = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_REFERENTIEL }),
  });
}

/** Déballe une réponse openapi-fetch, ou lève une erreur lisible. */
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

// ─────────────────────── Types d'entités ───────────────────────

export function useCreerTypeEntite() {
  return useEcritureReferentiel(
    (corps: components['schemas']['CreationTypeEntiteDto']) =>
      attendre(
        api.POST('/referentiel/types-entites', { body: corps }),
        "création du type d'entité impossible",
      ),
  );
}

export function useModifierTypeEntite() {
  return useEcritureReferentiel(
    ({
      id,
      ...corps
    }: components['schemas']['ModificationTypeEntiteDto'] & { id: string }) =>
      attendre(
        api.PATCH('/referentiel/types-entites/{id}', {
          params: { path: { id } },
          body: corps,
        }),
        'modification impossible',
      ),
  );
}

export function useSupprimerTypeEntite() {
  return useEcritureReferentiel((id: string) =>
    attendre(
      api.DELETE('/referentiel/types-entites/{id}', {
        params: { path: { id } },
      }),
      'suppression impossible',
    ),
  );
}

export function useOrdonnerTypesEntites() {
  return useEcritureReferentiel((ids: string[]) =>
    attendre(
      api.POST('/referentiel/types-entites/ordre', { body: { ids } }),
      'réordonnancement impossible',
    ),
  );
}

// ───────────────────────────── Champs ─────────────────────────────

export function useCreerChamp() {
  return useEcritureReferentiel(
    (corps: components['schemas']['CreationChampDto']) =>
      attendre(
        api.POST('/referentiel/champs', { body: corps }),
        'création du champ impossible',
      ),
  );
}

export function useModifierChamp() {
  return useEcritureReferentiel(
    ({
      id,
      ...corps
    }: components['schemas']['ModificationChampDto'] & { id: string }) =>
      attendre(
        api.PATCH('/referentiel/champs/{id}', {
          params: { path: { id } },
          body: corps,
        }),
        'modification impossible',
      ),
  );
}

export function useSupprimerChamp() {
  return useEcritureReferentiel((id: string) =>
    attendre(
      api.DELETE('/referentiel/champs/{id}', { params: { path: { id } } }),
      'suppression impossible',
    ),
  );
}

export function useOrdonnerChamps() {
  return useEcritureReferentiel(
    ({ typeEntiteId, ids }: { typeEntiteId: string; ids: string[] }) =>
      attendre(
        api.POST('/referentiel/types-entites/{id}/champs/ordre', {
          params: { path: { id: typeEntiteId } },
          body: { ids },
        }),
        'réordonnancement impossible',
      ),
  );
}

// ─────────────────────────── Types de liens ───────────────────────────

export function useCreerTypeLien() {
  return useEcritureReferentiel(
    (corps: components['schemas']['CreationTypeLienDto']) =>
      attendre(
        api.POST('/referentiel/types-liens', { body: corps }),
        'création du type de lien impossible',
      ),
  );
}

export function useModifierTypeLien() {
  return useEcritureReferentiel(
    ({
      id,
      ...corps
    }: components['schemas']['ModificationTypeLienDto'] & { id: string }) =>
      attendre(
        api.PATCH('/referentiel/types-liens/{id}', {
          params: { path: { id } },
          body: corps,
        }),
        'modification impossible',
      ),
  );
}

export function useSupprimerTypeLien() {
  return useEcritureReferentiel((id: string) =>
    attendre(
      api.DELETE('/referentiel/types-liens/{id}', { params: { path: { id } } }),
      'suppression impossible',
    ),
  );
}

// ───────────────────────────── Onglets ─────────────────────────────

export function useCreerOnglet() {
  return useEcritureReferentiel(
    (corps: components['schemas']['CreationOngletDto']) =>
      attendre(
        api.POST('/referentiel/onglets', { body: corps }),
        "création de l'onglet impossible",
      ),
  );
}

export function useSupprimerOnglet() {
  return useEcritureReferentiel((id: string) =>
    attendre(
      api.DELETE('/referentiel/onglets/{id}', { params: { path: { id } } }),
      'suppression impossible',
    ),
  );
}

export function useOrdonnerOnglets() {
  return useEcritureReferentiel(
    ({ typeEntiteId, ids }: { typeEntiteId: string; ids: string[] }) =>
      attendre(
        api.POST('/referentiel/types-entites/{id}/onglets/ordre', {
          params: { path: { id: typeEntiteId } },
          body: { ids },
        }),
        'réordonnancement impossible',
      ),
  );
}

export function useComposerOnglet() {
  return useEcritureReferentiel(
    ({
      id,
      typesLiens,
    }: {
      id: string;
      typesLiens: { typeLienId: string; sens: SensLien }[];
    }) =>
      attendre(
        api.PUT('/referentiel/onglets/{id}/types-liens', {
          params: { path: { id } },
          body: { typesLiens },
        }),
        "composition de l'onglet impossible",
      ),
  );
}

export function useApercuGabarit() {
  return useMutation({
    mutationFn: (modeleLibelle: string) =>
      attendre(
        api.POST('/referentiel/types-entites/apercu-gabarit', {
          body: { modeleLibelle },
        }),
        'gabarit invalide',
      ),
  });
}
