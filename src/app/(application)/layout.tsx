'use client';

import type { ReactNode } from 'react';

import { GardeSession } from '@/auth/garde-session';
import { Coquille } from '@/composants/coquille';

/**
 * Enveloppe des cinq zones. La connexion et le changement de mot de passe
 * vivent hors de ce groupe : ils n'ont ni coquille, ni session à garder.
 */
export default function ApplicationLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GardeSession>
      <Coquille>{children}</Coquille>
    </GardeSession>
  );
}
