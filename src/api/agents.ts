'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type AgentResume = components['schemas']['AgentDto'];
export type CreationAgent = components['schemas']['CreationAgentDto'];
export type ModificationAgent = components['schemas']['ModificationAgentDto'];
export type AgentAvecMotDePasse =
  components['schemas']['AgentAvecMotDePasseDto'];

export const CLE_AGENTS = ['agents'] as const;

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

export function useAgents(anonymises = false) {
  return useQuery({
    queryKey: [...CLE_AGENTS, { anonymises }],
    retry: false,
    staleTime: 60_000,
    queryFn: () =>
      attendre(
        api.GET('/agents', { params: { query: { anonymises } } }),
        'liste des comptes indisponible',
      ),
  });
}

function useEcriture<Variables, Resultat>(
  action: (variables: Variables) => Promise<Resultat>,
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: action,
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_AGENTS }),
  });
}

export function useCreerAgent() {
  return useEcriture((corps: CreationAgent) =>
    attendre<AgentAvecMotDePasse>(
      api.POST('/agents', { body: corps }),
      'création impossible',
    ),
  );
}

export function useModifierAgent() {
  return useEcriture(({ id, ...corps }: ModificationAgent & { id: string }) =>
    attendre<AgentResume>(
      api.PATCH('/agents/{id}', { params: { path: { id } }, body: corps }),
      'modification impossible',
    ),
  );
}

export function useReinitialiserMotDePasse() {
  return useEcriture((id: string) =>
    attendre<AgentAvecMotDePasse>(
      api.POST('/agents/{id}/mot-de-passe', { params: { path: { id } } }),
      'réinitialisation impossible',
    ),
  );
}

export function useAnonymiserAgent() {
  return useEcriture((id: string) =>
    attendre<AgentResume>(
      api.POST('/agents/{id}/anonymiser', { params: { path: { id } } }),
      'anonymisation impossible',
    ),
  );
}
