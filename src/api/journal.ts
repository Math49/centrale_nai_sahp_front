'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type EntreeAudit = components['schemas']['EntreeAuditDto'];
export type EntreeConsultation = components['schemas']['EntreeConsultationDto'];
export type EntiteOrpheline = components['schemas']['EntiteOrphelineDto'];

export const CLE_JOURNAL = ['journal'] as const;

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

export interface FiltresAudit {
  agentId?: string;
  cibleId?: string;
  action?: string;
}

export function useJournalAudit(filtres: FiltresAudit) {
  return useQuery({
    queryKey: [...CLE_JOURNAL, 'audit', filtres],
    queryFn: () =>
      attendre(
        api.GET('/journal/audit', {
          params: {
            query: {
              agent: filtres.agentId,
              cible: filtres.cibleId,
              action: filtres.action || undefined,
            },
          },
        }),
        'journal d’audit indisponible',
      ),
  });
}

export interface FiltresConsultation {
  agentId?: string;
  objetId?: string;
  superAdmin?: boolean;
  derogation?: boolean;
}

export function useJournalConsultations(filtres: FiltresConsultation) {
  return useQuery({
    queryKey: [...CLE_JOURNAL, 'consultations', filtres],
    queryFn: () =>
      attendre(
        api.GET('/journal/consultations', {
          params: {
            query: {
              agent: filtres.agentId,
              objet: filtres.objetId,

              superAdmin: filtres.superAdmin ? true : undefined,
              derogation: filtres.derogation ? true : undefined,
            },
          },
        }),
        'journal de consultation indisponible',
      ),
  });
}

export function useOrphelines() {
  return useQuery({
    queryKey: [...CLE_JOURNAL, 'orphelines'],
    queryFn: () =>
      attendre(
        api.GET('/journal/orphelines'),
        'liste des orphelines indisponible',
      ),
  });
}
