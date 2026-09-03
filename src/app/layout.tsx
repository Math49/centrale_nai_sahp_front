import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

import { Fournisseurs } from '@/fournisseurs';
import '@fortawesome/fontawesome-free/css/all.min.css';
// Leaflet doit être chargé avant le premier rendu d'une carte : sans sa feuille,
// les tuiles se positionnent de travers le temps d'un battement.
import 'leaflet/dist/leaflet.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Centrale N&I',
  description:
    'Narcotics & Investigations — San Andreas Highway Patrol. Usage interne.',

  robots: { index: false, follow: false },
};

export default function RacineLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <Script src="/runtime-config.js?v=2" strategy="beforeInteractive" />
        <link
          rel="icon"
          type="image/x-icon"
          href="/images/logos/logo_nai.png"
        />
      </head>
      <body>
        <Fournisseurs>{children}</Fournisseurs>
      </body>
    </html>
  );
}
