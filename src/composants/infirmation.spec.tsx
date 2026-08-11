import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { magasinSession, type AgentConnecte } from '@/auth/session';
import { BoutonInfirmer } from './infirmation';

const AGENT: AgentConnecte = {
  id: '9d6f2c1e-0000-4000-8000-000000000005',
  matricule: 'si-003',
  prenom: 'Noa',
  nom: 'Duval',
  roleCode: 'senior_investigator',
  superAdmin: false,
  doitChangerMdp: false,
  permissions: ['fait.infirmer'],
};

const FAIT = '3f1c9a44-0000-4000-8000-00000000aaaa';

function repondre(statut = 200): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: FAIT, etat: 'infirme' }), {
          status: statut,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    ),
  );
}

function afficher() {
  magasinSession.ouvrir(AGENT);

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <BoutonInfirmer faitId={FAIT} quoi="présent lors de Braquage fourgon" />
    </QueryClientProvider>,
  );
}

function ouvrirLaModale() {
  fireEvent.click(screen.getByRole('button', { name: 'infirmer' }));
}

describe('BoutonInfirmer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  it('n’offre aucun bouton qui dise « supprimer »', () => {
    repondre();
    afficher();
    ouvrirLaModale();

    for (const bouton of screen.getAllByRole('button')) {
      expect(bouton.textContent ?? '').not.toMatch(/supprim/i);
    }

    expect(
      screen.getByText(/reste consultable dans l’onglet Historique/),
    ).toBeInTheDocument();
  });

  it('n’envoie rien sans motif', () => {
    repondre();
    afficher();
    ouvrirLaModale();

    fireEvent.click(screen.getByRole('button', { name: 'Infirmer' }));

    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it('n’envoie rien sur un motif trop court', () => {
    repondre();
    afficher();
    ouvrirLaModale();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: 'Infirmer' }));

    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
    expect(screen.getByText(/au moins trois caractères/)).toBeInTheDocument();
  });

  it('transmet le motif avec l’infirmation', async () => {
    repondre();
    afficher();
    ouvrirLaModale();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Vidéosurveillance — ce n’était pas lui' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Infirmer' }));

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());

    const appel = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(appel.url).toContain(`/faits/${FAIT}/infirmer`);
    expect(await appel.text()).toContain('ce n’était pas lui');
  });

  it('referme la modale une fois le fait infirmé', async () => {
    repondre();
    afficher();
    ouvrirLaModale();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Rapport rectificatif du 09/08' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Infirmer' }));

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('garde la modale ouverte et montre le refus de l’API', async () => {
    repondre(409);
    afficher();
    ouvrirLaModale();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Déjà infirmé ailleurs' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Infirmer' }));

    await waitFor(() => expect(vi.mocked(fetch)).toHaveBeenCalled());

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
