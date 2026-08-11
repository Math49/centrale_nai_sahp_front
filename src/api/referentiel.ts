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

  libelleLu: string;
}

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

function useEcritureReferentiel<Variables, Resultat>(
  action: (variables: Variables) => Promise<Resultat>,
): UseMutationResult<Resultat, Error, Variables> {
  const client = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_REFERENTIEL }),
  });
}

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
