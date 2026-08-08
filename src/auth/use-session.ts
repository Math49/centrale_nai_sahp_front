'use client';

import { useMutation } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { api } from '@/api/client';
import { MESSAGE_INJOIGNABLE, messageDErreur } from '@/api/erreurs';
import { magasinSession, type EtatSession } from './session';

const VIDE_SERVEUR: EtatSession = {
  jeton: null,
  agent: null,
  raisonFermeture: null,
};

export function useSession(): EtatSession {
  return useSyncExternalStore(
    magasinSession.abonner,
    magasinSession.lire,
    // Au rendu serveur, aucune session n'existe : le jeton ne vit qu'en
    // mémoire du navigateur.
    () => VIDE_SERVEUR,
  );
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
      magasinSession.ouvrir(data.jeton, data.agent);
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
      // Le changement invalide l'ancien jeton, y compris celui de cet appel :
      // l'API en renvoie un neuf, qu'il faut adopter immédiatement.
      magasinSession.renouveler(data.jeton, data.agent);
    },
  });
}

export function deconnecter(): void {
  magasinSession.fermer('volontaire');
}
