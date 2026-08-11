'use client';

import { useMutation } from '@tanstack/react-query';
import { useEffect, useSyncExternalStore } from 'react';

import { api } from '@/api/client';
import { MESSAGE_INJOIGNABLE, messageDErreur } from '@/api/erreurs';
import { magasinSession, type EtatSession } from './session';

const VIDE_SERVEUR: EtatSession = { agent: null, raisonFermeture: null };

export function useSession(): EtatSession {
  return useSyncExternalStore(
    magasinSession.abonner,
    magasinSession.lire,

    () => VIDE_SERVEUR,
  );
}

export function useSessionPrete(): boolean {
  return useSyncExternalStore(
    magasinSession.abonner,
    magasinSession.estPrete,
    () => false,
  );
}

export function useReprendreSession(): void {
  useEffect(() => {
    if (magasinSession.estPrete()) {
      return;
    }

    let abandonne = false;

    void api
      .GET('/auth/moi')
      .then(({ data }) => {
        if (!abandonne) {
          magasinSession.reprendre(data ?? null);
        }
      })
      .catch(() => {
        if (!abandonne) {
          magasinSession.reprendre(null);
        }
      });

    return () => {
      abandonne = true;
    };
  }, []);
}

export function useConnexion() {
  return useMutation({
    mutationFn: async (identifiants: {
      matricule: string;
      motDePasse: string;
    }) => {
      const { data, error } = await api
        .POST('/auth/login', { body: identifiants })
        .catch(() => {
          throw new Error(MESSAGE_INJOIGNABLE);
        });

      if (error || !data) {
        throw new Error(messageDErreur(error, 'identifiants invalides'));
      }

      return data;
    },
    onSuccess: (data) => {
      magasinSession.ouvrir(data.agent);
    },
  });
}

export function useChangementMotDePasse() {
  return useMutation({
    mutationFn: async (motsDePasse: { ancien: string; nouveau: string }) => {
      const { data, error } = await api.POST('/auth/mot-de-passe', {
        body: motsDePasse,
      });

      if (error || !data) {
        throw new Error(
          messageDErreur(error, 'le changement de mot de passe a échoué'),
        );
      }

      return data;
    },
    onSuccess: (data) => {
      magasinSession.ouvrir(data.agent);
    },
  });
}

export async function deconnecter(): Promise<void> {
  await api.POST('/auth/deconnexion', {}).catch(() => undefined);
  magasinSession.fermer('volontaire');
}
