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

/**
 * Comptes agents.
 *
 * Exige `agent.gerer`. La requête ne réessaie pas : un refus de permission ne
 * devient pas un accord parce qu'on insiste.
 *
 * Les comptes anonymisés sont hors liste par défaut. Ils ne sont pas partis —
 * rien n'est jamais supprimé — mais un annuaire de service n'est pas l'endroit
 * où les lire tous les jours.
 */
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

/**
 * Création d'un compte.
 *
 * Il n'existe pas d'inscription libre : un compte est ouvert par quelqu'un, et
 * part en changement de mot de passe imposé. Le mot de passe provisoire revient
 * dans la réponse **une seule fois** — il n'est stocké nulle part en clair, et
 * l'écran doit le donner à lire avant de le perdre.
 */
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

/**
 * Réinitialisation du mot de passe.
 *
 * Révoque les jetons du compte et le repasse en changement imposé : l'agent
 * dont on remet le mot de passe est déconnecté partout, ce que l'écran annonce
 * avant de le faire.
 */
export function useReinitialiserMotDePasse() {
  return useEcriture((id: string) =>
    attendre<AgentAvecMotDePasse>(
      api.POST('/agents/{id}/mot-de-passe', { params: { path: { id } } }),
      'réinitialisation impossible',
    ),
  );
}

/**
 * Anonymisation — seule forme de retrait d'un compte.
 *
 * L'enregistrement reste, ses références aussi : le journal désigne un agent
 * par son identifiant, jamais par son nom, et c'est ce qui fait qu'anonymiser
 * ne casse aucune trace tout en effaçant vraiment la personne.
 */
export function useAnonymiserAgent() {
  return useEcriture((id: string) =>
    attendre<AgentResume>(
      api.POST('/agents/{id}/anonymiser', { params: { path: { id } } }),
      'anonymisation impossible',
    ),
  );
}
