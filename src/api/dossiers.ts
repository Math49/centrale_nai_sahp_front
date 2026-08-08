'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { CLE_ENTITES } from './entites';
import { messageDErreur } from './erreurs';

export type DossierResume = components['schemas']['DossierResumeDto'];
export type PanneauDossier = components['schemas']['PanneauDossierDto'];
export type Rattachement = components['schemas']['RattachementDto'];
export type CreationDossier = components['schemas']['CreationDossierDto'];

export const CLE_DOSSIERS = ['dossiers'] as const;

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

export function useDossiers() {
  return useQuery({
    queryKey: CLE_DOSSIERS,
    queryFn: () =>
      attendre(api.GET('/dossiers'), 'liste des dossiers indisponible'),
  });
}

/**
 * Panneau de dossier.
 *
 * `actif` reste faux tant qu'on n'accède pas à la fiche **par le dossier** :
 * le panneau n'est visible que par cette entrée, et une fiche ouverte
 * directement n'en déclenche aucune requête.
 */
export function usePanneauDossier(id: string | null) {
  return useQuery({
    queryKey: [...CLE_DOSSIERS, id],
    enabled: id !== null,
    queryFn: () =>
      attendre(
        api.GET('/dossiers/{id}', { params: { path: { id: id! } } }),
        'dossier indisponible',
      ),
  });
}

function useEcriture<Variables, Resultat>(
  action: (variables: Variables) => Promise<Resultat>,
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: async () => {
      // Le suivi touche les deux côtés : la liste des dossiers et la fiche de
      // l'entité, qui mentionne ses rattachements.
      await Promise.all([
        client.invalidateQueries({ queryKey: CLE_DOSSIERS }),
        client.invalidateQueries({ queryKey: CLE_ENTITES }),
      ]);
    },
  });
}

export function useCreerDossier() {
  return useEcriture((corps: CreationDossier) =>
    attendre(api.POST('/dossiers', { body: corps }), 'création impossible'),
  );
}

export function useModifierDossier() {
  return useEcriture(
    ({
      id,
      ...corps
    }: components['schemas']['ModificationDossierDto'] & { id: string }) =>
      attendre(
        api.PATCH('/dossiers/{id}', {
          params: { path: { id } },
          body: corps,
        }),
        'modification impossible',
      ),
  );
}

export function useSuivre() {
  return useEcriture(
    ({ dossierId, entiteId }: { dossierId: string; entiteId: string }) =>
      attendre(
        api.POST('/dossiers/{id}/suivi', {
          params: { path: { id: dossierId } },
          body: { entiteId },
        }),
        'ajout au suivi impossible',
      ),
  );
}

export function useNePlusSuivre() {
  return useEcriture(
    ({ dossierId, entiteId }: { dossierId: string; entiteId: string }) =>
      attendre(
        api.DELETE('/dossiers/{id}/suivi/{entiteId}', {
          params: { path: { id: dossierId, entiteId } },
        }),
        'retrait du suivi impossible',
      ),
  );
}

export function useHabiliter() {
  return useEcriture(
    ({ dossierId, agentId }: { dossierId: string; agentId: string }) =>
      attendre(
        api.POST('/dossiers/{id}/habilitations', {
          params: { path: { id: dossierId } },
          body: { agentId },
        }),
        'habilitation impossible',
      ),
  );
}

export function useRetirerHabilitation() {
  return useEcriture(
    ({ dossierId, agentId }: { dossierId: string; agentId: string }) =>
      attendre(
        api.DELETE('/dossiers/{id}/habilitations/{agentId}', {
          params: { path: { id: dossierId, agentId } },
        }),
        'retrait impossible',
      ),
  );
}
