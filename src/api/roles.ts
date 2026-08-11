'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type Role = components['schemas']['RoleDto'];
export type PermissionCataloguee =
  components['schemas']['PermissionCatalogueeDto'];

export const CLE_ROLES = ['roles'] as const;

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

export function useRoles() {
  return useQuery({
    queryKey: CLE_ROLES,
    staleTime: 5 * 60 * 1000,
    queryFn: () => attendre(api.GET('/roles'), 'grades indisponibles'),
  });
}

export function useCataloguePermissions() {
  return useQuery({
    queryKey: [...CLE_ROLES, 'catalogue'],
    retry: false,
    staleTime: 30 * 60 * 1000,
    queryFn: () =>
      attendre(
        api.GET('/roles/catalogue-permissions'),
        'catalogue des permissions indisponible',
      ),
  });
}

export function useModifierRole() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...corps
    }: {
      id: string;
      libelle?: string;
      permissions?: string[];
    }) =>
      attendre<Role>(
        api.PATCH('/roles/{id}', { params: { path: { id } }, body: corps }),
        'configuration impossible',
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: CLE_ROLES }),
  });
}
