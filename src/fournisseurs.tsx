'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Fournisseurs({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Le référentiel sera mis en cache longue durée et invalidé
            // seulement par l'administration (lot 3). Les données d'enquête,
            // elles, changent sous plusieurs agents à la fois.
            staleTime: 30_000,
            retry: (tentatives, erreur) => {
              // Réessayer un refus d'accès ne le transformera pas en accord.
              const message = erreur instanceof Error ? erreur.message : '';
              if (/401|403|404/.test(message)) {
                return false;
              }
              return tentatives < 2;
            },
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
