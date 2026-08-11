'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { useReprendreSession } from '@/auth/use-session';

export function Fournisseurs({ children }: { children: ReactNode }) {
  useReprendreSession();

  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (tentatives, erreur) => {
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
