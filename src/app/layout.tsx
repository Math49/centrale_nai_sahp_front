import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Fournisseurs } from '@/fournisseurs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centrale N&I',
  description:
    'Narcotics & Investigations — San Andreas Highway Patrol. Usage interne.',
  // Un outil d'enquête n'a rien à faire dans un index.
  robots: { index: false, follow: false },
};

export default function RacineLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Fournisseurs>{children}</Fournisseurs>
      </body>
    </html>
  );
}
