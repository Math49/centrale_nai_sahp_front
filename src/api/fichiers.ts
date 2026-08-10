'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { api } from './client';
import type { components } from './contrat';
import { messageDErreur } from './erreurs';

export type Fichier = components['schemas']['FichierDto'];

export const CLE_FICHIERS = ['fichiers'] as const;

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

export function useFichiers(entiteId: string) {
  return useQuery({
    queryKey: [...CLE_FICHIERS, entiteId],
    queryFn: () =>
      attendre(
        api.GET('/entites/{id}/fichiers', {
          params: { path: { id: entiteId } },
        }),
        'pièces jointes indisponibles',
      ),
  });
}

/**
 * Dépôt d'une image.
 *
 * `bodySerializer` rend le `FormData` tel quel : la sérialisation JSON par
 * défaut le viderait. Passer par le client typé plutôt que par un `fetch` nu
 * garde l'intercepteur de session — un 401 doit fermer la session ici comme
 * ailleurs.
 */
export function useDeposerFichier() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({
      entiteId,
      fichier,
    }: {
      entiteId: string;
      fichier: File;
    }) => {
      const corps = new FormData();
      corps.append('fichier', fichier);

      return attendre(
        api.POST('/entites/{id}/fichiers', {
          params: { path: { id: entiteId } },
          body: corps as unknown as Record<string, never>,
          bodySerializer: (valeur: unknown) => valeur as FormData,
        }),
        'dépôt impossible',
      );
    },
    onSuccess: (_resultat, variables) =>
      client.invalidateQueries({
        queryKey: [...CLE_FICHIERS, variables.entiteId],
      }),
  });
}

export function useSupprimerFichier() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; entiteId: string }) =>
      attendre(
        api.DELETE('/fichiers/{id}', {
          params: { path: { id } },
        }),
        'suppression impossible',
      ),
    onSuccess: (_resultat, variables) =>
      client.invalidateQueries({
        queryKey: [...CLE_FICHIERS, variables.entiteId],
      }),
  });
}

/**
 * L'octet d'une image, en URL locale.
 *
 * Une balise `img` ne porte pas le jeton : l'image se récupère donc par une
 * requête authentifiée, puis s'affiche depuis un `blob:` révoqué au démontage.
 * C'est le prix — assumé — de ne jamais servir un dossier en statique.
 */
export function useApercuFichier(id: string) {
  const [url, definirUrl] = useState<string | null>(null);

  const octets = useQuery({
    queryKey: [...CLE_FICHIERS, 'apercu', id],
    // Un aperçu ne se recharge pas à chaque retour sur la fiche.
    staleTime: 5 * 60 * 1000,
    queryFn: () =>
      attendre(
        api.GET('/fichiers/{id}', {
          params: { path: { id } },
          parseAs: 'blob',
        }) as Promise<{ data?: Blob; error?: unknown }>,
        'image indisponible',
      ),
  });

  useEffect(() => {
    if (!octets.data) {
      return;
    }

    const locale = URL.createObjectURL(octets.data);
    definirUrl(locale);

    return () => {
      URL.revokeObjectURL(locale);
      definirUrl(null);
    };
  }, [octets.data]);

  return { url, enCours: octets.isPending, enErreur: octets.isError };
}
