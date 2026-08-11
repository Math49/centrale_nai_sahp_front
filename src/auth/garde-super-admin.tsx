'use client';

import type { ReactNode } from 'react';

import { EtatVide } from '@/composants/etat-vide';
import { useSession } from './use-session';

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
