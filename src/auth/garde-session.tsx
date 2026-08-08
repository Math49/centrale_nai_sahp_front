'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSession } from './use-session';

/**
 * Porte d'entrée des zones applicatives.
 *
 * Le jeton ne vit qu'en mémoire : au premier rendu après un rechargement, il
 * n'y en a pas, et l'agent repart par la connexion. C'est voulu.
 *
 * Ce garde n'est **pas** une mesure de sécurité — il masque des écrans, il ne
 * protège pas des données. Toute donnée est refusée par l'API elle-même, qui
 * ne fait confiance à rien de ce qui vient du navigateur.
 */
export function GardeSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { jeton, agent } = useSession();

  useEffect(() => {
    if (!jeton || !agent) {
      router.replace('/connexion');
      return;
    }

    if (agent.doitChangerMdp) {
      router.replace('/mot-de-passe');
    }
  }, [jeton, agent, router]);

  if (!jeton || !agent || agent.doitChangerMdp) {
    return null;
  }

  return <>{children}</>;
}
