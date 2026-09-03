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

export type EvenementHistorique =
  components['schemas']['EvenementHistoriqueDto'];
export type ChampDeFiche = components['schemas']['ChampDeFicheDto'];
export type LienDeFiche = components['schemas']['LienDeFicheDto'];
export type OngletPeuple = components['schemas']['OngletPeupleDto'];
export type AgentHabilite = components['schemas']['AgentHabiliteDto'];

/**
 * Ce qu'un fait de champ peut porter comme valeur.
 *
 * Le point de carte est arrivé avec le type `carte` : sans lui ici, tout appel
 * qui en transporte un ne compile plus. La forme réelle n'est vérifiée que par
 * l'API, dont la validation dépend du type du champ — connu à l'exécution seule.
 */
export type ValeurDeFait = string | number | boolean | { x: number; y: number };

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

export function useEntites(filtres: {
  typeEntiteId?: string;
  q?: string;
  etat?: 'actif' | 'archive';
}) {
  return useQuery({
    queryKey: [...CLE_ENTITES, 'liste', filtres],
    queryFn: () =>
      attendre(
        api.GET('/entites', {
          params: {
            query: {
              type: filtres.typeEntiteId,
              q: filtres.q || undefined,
              etat: filtres.etat,
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

export function useHistorique(id: string, actif: boolean) {
  return useQuery({
    queryKey: [...CLE_ENTITES, id, 'historique'],
    enabled: actif,
    queryFn: () =>
      attendre(
        api.GET('/entites/{id}/historique', { params: { path: { id } } }),
        'historique indisponible',
      ),
  });
}

export function useModifierEntite() {
  return useEcriture(
    ({ id, ...corps }: { id: string; note?: string; visibilite?: string }) =>
      attendre(
        api.PATCH('/entites/{id}', {
          params: { path: { id } },
          body: corps as components['schemas']['ModificationEntiteDto'],
        }),
        'modification impossible',
      ),
  );
}

export function useModifierFait() {
  return useEcriture(
    ({
      id,
      ...corps
    }: {
      id: string;
      valeur?: ValeurDeFait;
      source?: string;
      fiabilite?: number;
      dateConstatation?: string;
      visibilite?: string;
    }) =>
      attendre(
        api.PATCH('/faits/{id}', {
          params: { path: { id } },
          body: corps as components['schemas']['ModificationFaitDto'],
        }),
        'modification impossible',
      ),
  );
}

export function useArchiverEntite() {
  return useEcriture(({ id, archiver }: { id: string; archiver: boolean }) =>
    attendre(
      archiver
        ? api.POST('/entites/{id}/archiver', { params: { path: { id } } })
        : api.POST('/entites/{id}/desarchiver', { params: { path: { id } } }),
      'changement d’état impossible',
    ),
  );
}

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

export function useInfirmerFait() {
  return useEcriture(({ id, motif }: { id: string; motif: string }) =>
    attendre(
      api.POST('/faits/{id}/infirmer', {
        params: { path: { id } },
        body: { motif },
      }),
      'infirmation impossible',
    ),
  );
}

export function useFusionner() {
  return useEcriture(({ id, versId }: { id: string; versId: string }) =>
    attendre(
      api.POST('/entites/{id}/fusion', {
        params: { path: { id } },
        body: { versId },
      }),
      'fusion impossible',
    ),
  );
}

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

/**
 * Habilitation nominative sur une donnée.
 *
 * Indispensable dès que la donnée est classée : chaque gardien se franchit pour
 * lui-même, et être habilité sur le dossier qui la suit **n'ouvre pas** la
 * donnée. C'est précisément ce qui rendait une fiche classée inaccessible à
 * tout le monde tant que cette porte n'existait pas.
 */
export function useHabiliterSurEntite() {
  return useEcriture(({ id, agentId }: { id: string; agentId: string }) =>
    attendre(
      api.POST('/entites/{id}/habilitations', {
        params: { path: { id } },
        body: { agentId },
      }),
      'habilitation impossible',
    ),
  );
}

export function useRetirerHabilitationSurEntite() {
  return useEcriture(({ id, agentId }: { id: string; agentId: string }) =>
    attendre(
      api.DELETE('/entites/{id}/habilitations/{agentId}', {
        params: { path: { id, agentId } },
      }),
      'retrait impossible',
    ),
  );
}
