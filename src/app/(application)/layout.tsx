'use client';

import type { ReactNode } from 'react';

import { GardeSession } from '@/auth/garde-session';
import { Coquille } from '@/composants/coquille';

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
