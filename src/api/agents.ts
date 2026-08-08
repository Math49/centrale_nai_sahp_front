'use client';

import { useQuery } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';

export type AgentResume = components['schemas']['AgentDto'];

/**
 * Comptes agents.
 *
 * Exige `agent.gerer`. La requête ne réessaie pas : un refus de permission ne
 * devient pas un accord parce qu'on insiste.
 */
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    retry: false,
    staleTime: 60_000,
    queryFn: async (): Promise<AgentResume[]> => {
      const { data, error } = await api.GET('/agents');

      if (error || !data) {
        throw new Error('liste des comptes indisponible');
      }

      return data;
    },
  });
}
