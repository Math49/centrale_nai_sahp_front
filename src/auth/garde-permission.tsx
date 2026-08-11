'use client';

import type { ReactNode } from 'react';

import { EtatVide } from '@/composants/etat-vide';
import { useSession } from './use-session';

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
