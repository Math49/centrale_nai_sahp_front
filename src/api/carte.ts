'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type TypeRepere = components['schemas']['TypeRepereDto'];
export type Repere = components['schemas']['RepereDto'];
export type PointDeDonnee = components['schemas']['PointDeDonneeDto'];
export type CreationRepere = components['schemas']['CreationRepereDto'];
export type ModificationRepere = components['schemas']['ModificationRepereDto'];
export type NatureRepere = TypeRepere['nature'];

export const CLE_CARTE = ['carte'] as const;

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

function useEcriture<Variables, Resultat>(
  action: (variables: Variables) => Promise<Resultat>,
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_CARTE }),
  });
}

// ───────────────────────── Types de repères ─────────────────────────

export function useTypesReperes() {
  return useQuery({
    queryKey: [...CLE_CARTE, 'types'],
    retry: false,
    staleTime: 30 * 60 * 1000,
    queryFn: () =>
      attendre(
        api.GET('/carte/types-reperes'),
        'types de repères indisponibles',
      ),
  });
}

export function useCreerTypeRepere() {
  return useEcriture((corps: components['schemas']['CreationTypeRepereDto']) =>
    attendre(
      api.POST('/carte/types-reperes', { body: corps }),
      'création impossible',
    ),
  );
}

export function useModifierTypeRepere() {
  return useEcriture(
    ({
      id,
      ...corps
    }: components['schemas']['ModificationTypeRepereDto'] & { id: string }) =>
      attendre(
        api.PATCH('/carte/types-reperes/{id}', {
          params: { path: { id } },
          body: corps,
        }),
        'modification impossible',
      ),
  );
}

export function useSupprimerTypeRepere() {
  return useEcriture((id: string) =>
    attendre(
      api.DELETE('/carte/types-reperes/{id}', { params: { path: { id } } }),
      'retrait impossible',
    ),
  );
}

export function useOrdonnerTypesReperes() {
  return useEcriture((ids: string[]) =>
    attendre(
      api.POST('/carte/types-reperes/ordre', { body: { ids } }),
      'réordonnancement impossible',
    ),
  );
}

// ───────────────────────────── Repères ─────────────────────────────

/**
 * Les repères visibles.
 *
 * Ce que l'agent n'a pas le droit de voir **n'est pas là** — pas masqué, pas
 * grisé : absent. Ne rien ajouter côté front qui compte, mentionne ou signale
 * ce qui manque : sur une carte, la position est le renseignement.
 */
export function useReperes(archives = false) {
  return useQuery({
    queryKey: [...CLE_CARTE, 'reperes', { archives }],
    retry: false,
    queryFn: () =>
      attendre(
        api.GET('/carte/reperes', { params: { query: { archives } } }),
        'repères indisponibles',
      ),
  });
}

/** Les points portés par les fiches — lecture seule sur la carte. */
export function usePointsDesDonnees() {
  return useQuery({
    queryKey: [...CLE_CARTE, 'donnees'],
    retry: false,
    queryFn: () =>
      attendre(api.GET('/carte/donnees'), 'points des données indisponibles'),
  });
}

export function useCreerRepere() {
  return useEcriture((corps: CreationRepere) =>
    attendre(
      api.POST('/carte/reperes', { body: corps }),
      'repère non enregistré',
    ),
  );
}

export function useModifierRepere() {
  return useEcriture(({ id, ...corps }: ModificationRepere & { id: string }) =>
    attendre(
      api.PATCH('/carte/reperes/{id}', {
        params: { path: { id } },
        body: corps,
      }),
      'modification impossible',
    ),
  );
}

/**
 * Retrait d'un repère — **archivage, jamais suppression**.
 *
 * Ce qu'on a cru savoir d'un terrain fait partie de l'enquête, même quand on
 * cesse d'y croire. Aucun bouton ne dit « supprimer ».
 */
export function useArchiverRepere() {
  return useEcriture(({ id, archiver }: { id: string; archiver: boolean }) =>
    attendre(
      archiver
        ? api.POST('/carte/reperes/{id}/archiver', { params: { path: { id } } })
        : api.POST('/carte/reperes/{id}/desarchiver', {
            params: { path: { id } },
          }),
      'changement d’état impossible',
    ),
  );
}

export function useHabiliterSurRepere() {
  return useEcriture(({ id, agentId }: { id: string; agentId: string }) =>
    attendre(
      api.POST('/carte/reperes/{id}/habilitations', {
        params: { path: { id } },
        body: { agentId },
      }),
      'habilitation impossible',
    ),
  );
}

export function useRetirerHabilitationSurRepere() {
  return useEcriture(({ id, agentId }: { id: string; agentId: string }) =>
    attendre(
      api.DELETE('/carte/reperes/{id}/habilitations/{agentId}', {
        params: { path: { id, agentId } },
      }),
      'retrait impossible',
    ),
  );
}
