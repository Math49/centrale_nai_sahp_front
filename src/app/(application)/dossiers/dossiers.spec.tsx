import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { magasinSession, type AgentConnecte } from '@/auth/session';
import PageDossiers from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const SOCLE = {
  id: '9d6f2c1e-0000-4000-8000-00000000000f',
  matricule: 'vis-009',
  prenom: 'Camille',
  nom: 'Orsat',
  superAdmin: false,
  doitChangerMdp: false,
};

const VISITEUR: AgentConnecte = {
  ...SOCLE,
  roleCode: 'visiteur',
  permissions: ['dossier.consulter'],
};

const JUNIOR: AgentConnecte = {
  ...SOCLE,
  roleCode: 'junior_investigator',
  permissions: ['dossier.consulter', 'dossier.creer'],
};

function afficher(agent: AgentConnecte, dossiers: unknown[] = []) {
  magasinSession.ouvrir(agent);

  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(JSON.stringify(dossiers), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    ),
  );

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <PageDossiers />
    </QueryClientProvider>,
  );
}

describe('Dossiers — ce que le grade ouvre', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  it('un grade sans « dossier.creer » ne voit aucun bouton d’ouverture', async () => {
    afficher(VISITEUR);

    // L'état vide arrive après la réponse : c'est là que l'invitation
    // apparaissait, et c'est la seconde porte qu'il fallait fermer.
    await screen.findByText('Aucun dossier ouvert.');

    expect(
      screen.queryByRole('button', { name: 'Nouveau dossier' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Ouvrir un dossier' }),
    ).toBeNull();
  });

  it('le même écran l’offre à qui porte le geste', async () => {
    afficher(JUNIOR);

    await screen.findByText('Aucun dossier ouvert.');

    expect(
      screen.getByRole('button', { name: 'Nouveau dossier' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ouvrir un dossier' }),
    ).toBeInTheDocument();
  });
});
