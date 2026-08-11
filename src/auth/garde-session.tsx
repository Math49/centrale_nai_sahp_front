'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { EcranChargement } from '@/composants/chargement';
import { useSession, useSessionPrete } from './use-session';

export function GardeSession({ children }: { children: ReactNode }) {
  const router = useRouter();
  const prete = useSessionPrete();
  const { agent } = useSession();

  useEffect(() => {
    if (!prete) {
      return;
    }

    if (!agent) {
      router.replace('/connexion');
      return;
    }

    if (agent.doitChangerMdp) {
      router.replace('/mot-de-passe');
    }
  }, [prete, agent, router]);

  if (!prete || !agent || agent.doitChangerMdp) {
    return <EcranChargement />;
  }

  return <>{children}</>;
}
