'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSession, useSessionPrete } from './use-session';

/**
 * Porte d'entrée des zones applicatives.
 *
 * Elle **attend la réponse de l'API** avant de conclure quoi que ce soit : le
 * cookie de session est `httpOnly`, donc invisible au front, et rediriger avant
 * d'avoir demandé renverrait vers la connexion à chaque rechargement.
 *
 * Ce garde n'est **pas** une mesure de sécurité — il masque des écrans, il ne
 * protège pas des données. Toute donnée est refusée par l'API elle-même, qui
 * ne fait confiance à rien de ce qui vient du navigateur.
 */
export function GardeSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const prete = useSessionPrete();
  const { agent } = useSession();

  useEffect(() => {
    if (!prete) {
      return;
    }

    if (!agent) {
      router.replace('/connexion');
      return;
    }

    if (agent.doitChangerMdp) {
      router.replace('/mot-de-passe');
    }
  }, [prete, agent, router]);

  if (!prete || !agent || agent.doitChangerMdp) {
    return null;
  }

  return <>{children}</>;
}
