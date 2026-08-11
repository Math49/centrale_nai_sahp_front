'use client';

import type { ReactNode } from 'react';

import { EtatVide } from '@/composants/etat-vide';
import { useSession } from './use-session';

/**
 * Écran gouverné par une permission de grade.
 *
 * Comme la garde super-admin, ce n'est **pas** de la sécurité : l'API refuse
 * d'elle-même, et c'est elle qui fait foi. C'est de la courtoisie — ouvrir une
 * porte fermée pour n'y montrer qu'une erreur serait une mauvaise manière.
 *
 * Le super-admin passe partout : l'attribut du compte prime sur le jeu de
 * permissions de son grade.
 */
export function GardePermission({
  permission,
  explication,
  children,
}: {
  permission: string;
  explication: string;
  children: ReactNode;
}) {
  const { agent } = useSession();

  if (!agent?.superAdmin && !agent?.permissions.includes(permission)) {
    return (
      <EtatVide
        titre="Votre grade n’ouvre pas cet écran."
        explication={explication}
      />
    );
  }

  return <>{children}</>;
}
