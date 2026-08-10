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
    // Au rendu serveur, aucune session : elle se demande à l'API depuis le
    // navigateur, qui seul porte le cookie.
    () => VIDE_SERVEUR,
  );
}

/** L'API a-t-elle répondu sur l'existence d'une session ? */
export function useSessionPrete(): boolean {
  return useSyncExternalStore(
    magasinSession.abonner,
    magasinSession.estPrete,
    () => false,
  );
}

/**
 * Interroge l'API sur la session en cours, une fois, au démarrage.
 *
 * Le cookie est `httpOnly` : le front ne peut pas savoir seul s'il est
 * connecté. Il le demande. C'est ce qui fait qu'un rechargement de page ne
 * déconnecte plus — le cookie survit, la réponse revient, la session reprend.
 */
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
        // API injoignable : on ne prétend pas avoir de session, et l'écran de
        // connexion dira lui-même ce qui ne va pas.
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
          // L'API n'a pas répondu du tout : le distinguer d'un refus évite de
          // faire chercher à l'agent un mot de passe qui n'est pas en cause.
          throw new Error(MESSAGE_INJOIGNABLE);
        });

      if (error || !data) {
        throw new Error(messageDErreur(error, 'identifiants invalides'));
      }

      return data;
    },
    onSuccess: (data) => {
      // Le jeton du corps n'est pas retenu : le cookie posé par l'API suffit,
      // et c'est justement de ne pas l'avoir sous la main qui protège.
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
      // Le changement invalide tous les jetons de l'agent ; l'API repose un
      // cookie neuf dans la même réponse.
      magasinSession.ouvrir(data.agent);
    },
  });
}

/** Ferme la session côté API — le cookie est retiré par le serveur. */
export async function deconnecter(): Promise<void> {
  await api.POST('/auth/deconnexion', {}).catch(() => undefined);
  magasinSession.fermer('volontaire');
}
