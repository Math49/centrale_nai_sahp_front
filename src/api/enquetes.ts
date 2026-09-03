'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type ColonneKanban = components['schemas']['ColonneKanbanDto'];
export type CarteEnquete = components['schemas']['CarteEnqueteDto'];
export type AgentAssigne = components['schemas']['AgentAssigneDto'];
export type CreationCarte = components['schemas']['CreationCarteDto'];
export type ModificationCarte = components['schemas']['ModificationCarteDto'];

export const CLE_ENQUETES = ['enquetes'] as const;

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
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_ENQUETES }),
  });
}

// ────────────────────────── Colonnes ──────────────────────────

export function useColonnes() {
  return useQuery({
    queryKey: [...CLE_ENQUETES, 'colonnes'],
    retry: false,
    staleTime: 30 * 60 * 1000,
    queryFn: () =>
      attendre(api.GET('/enquetes/colonnes'), 'colonnes indisponibles'),
  });
}

export function useCreerColonne() {
  return useEcriture((corps: components['schemas']['CreationColonneDto']) =>
    attendre(
      api.POST('/enquetes/colonnes', { body: corps }),
      'création impossible',
    ),
  );
}

export function useModifierColonne() {
  return useEcriture(({ id, ...corps }: { id: string; libelle?: string }) =>
    attendre(
      api.PATCH('/enquetes/colonnes/{id}', {
        params: { path: { id } },
        body: corps,
      }),
      'modification impossible',
    ),
  );
}

export function useSupprimerColonne() {
  return useEcriture((id: string) =>
    attendre(
      api.DELETE('/enquetes/colonnes/{id}', { params: { path: { id } } }),
      'retrait impossible',
    ),
  );
}

export function useOrdonnerColonnes() {
  return useEcriture((ids: string[]) =>
    attendre(
      api.POST('/enquetes/colonnes/ordre', { body: { ids } }),
      'réordonnancement impossible',
    ),
  );
}

// ─────────────────────────── Cartes ───────────────────────────

/**
 * Les cartes visibles.
 *
 * Une carte classée hors de portée **n'est pas là** — son titre nomme souvent
 * ce qu'un dossier restreint protège. Ne rien ajouter qui compte ou signale ce
 * qui manque.
 */
export function useCartes(archives = false) {
  return useQuery({
    queryKey: [...CLE_ENQUETES, 'cartes', { archives }],
    retry: false,
    queryFn: () =>
      attendre(
        api.GET('/enquetes/cartes', { params: { query: { archives } } }),
        'cartes indisponibles',
      ),
  });
}

export function useCreerCarte() {
  return useEcriture((corps: CreationCarte) =>
    attendre(
      api.POST('/enquetes/cartes', { body: corps }),
      'carte non enregistrée',
    ),
  );
}

export function useModifierCarte() {
  return useEcriture(({ id, ...corps }: ModificationCarte & { id: string }) =>
    attendre(
      api.PATCH('/enquetes/cartes/{id}', {
        params: { path: { id } },
        body: corps,
      }),
      'modification impossible',
    ),
  );
}

export function useDeplacerCarte() {
  return useEcriture(
    ({
      id,
      colonneId,
      rang,
    }: {
      id: string;
      colonneId: string;
      rang: number;
    }) =>
      attendre(
        api.POST('/enquetes/cartes/{id}/deplacer', {
          params: { path: { id } },
          body: { colonneId, rang },
        }),
        'déplacement impossible',
      ),
  );
}

export function useArchiverCarte() {
  return useEcriture(({ id, archiver }: { id: string; archiver: boolean }) =>
    attendre(
      archiver
        ? api.POST('/enquetes/cartes/{id}/archiver', {
            params: { path: { id } },
          })
        : api.POST('/enquetes/cartes/{id}/desarchiver', {
            params: { path: { id } },
          }),
      'changement d’état impossible',
    ),
  );
}

export function useHabiliterSurCarte() {
  return useEcriture(({ id, agentId }: { id: string; agentId: string }) =>
    attendre(
      api.POST('/enquetes/cartes/{id}/habilitations', {
        params: { path: { id } },
        body: { agentId },
      }),
      'habilitation impossible',
    ),
  );
}

export function useRetirerHabilitationSurCarte() {
  return useEcriture(({ id, agentId }: { id: string; agentId: string }) =>
    attendre(
      api.DELETE('/enquetes/cartes/{id}/habilitations/{agentId}', {
        params: { path: { id, agentId } },
      }),
      'retrait impossible',
    ),
  );
}
