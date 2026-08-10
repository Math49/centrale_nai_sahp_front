'use client';

import type { ReactNode } from 'react';

import { EtatVide } from '@/composants/etat-vide';
import { useSession } from './use-session';

/**
 * Écrans de configuration du modèle métier.
 *
 * Réservés au super-admin, câblé en dur des deux côtés. Ici, on se contente
 * d'éviter de proposer une porte fermée : l'API refuse d'elle-même, et c'est
 * elle qui fait foi.
 */
export function GardeSuperAdmin({ children }: { children: ReactNode }) {
  const { agent } = useSession();

  if (!agent?.superAdmin) {
    return (
      <EtatVide
        titre="Réservé au super-admin."
        explication="La configuration du modèle métier — types de données, champs, types de liens, mise en page des fiches — ne se délègue pas par un jeu de permissions."
      />
    );
  }

  return <>{children}</>;
}
