import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ResultatRecherche } from '@/api/accueil';
import { magasinSession, type AgentConnecte } from '@/auth/session';
import { BarreRecherche } from './barre-recherche';

const pousser = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pousser }),
}));

const AGENT: AgentConnecte = {
  id: '9d6f2c1e-0000-4000-8000-000000000003',
  matricule: 'ji-004',
  prenom: 'Sasha',
  nom: 'Vane',
  roleCode: 'junior_investigator',
  superAdmin: false,
  doitChangerMdp: false,
  permissions: [],
};

const SULTAN: ResultatRecherche = {
  id: 'e-sultan',
  libelle: '8KLM204',
  nature: 'entite',
  typeCode: 'vehicule',
  visibilite: 'public',
};

const DOSSIER: ResultatRecherche = {
  id: 'd-morales',
  libelle: 'Morales',
  nature: 'dossier',
  typeCode: null,
  visibilite: 'restreint',
};

function repondre(resultats: ResultatRecherche[]): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(resultats), {
          status: 200,
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
      <BarreRecherche />
    </QueryClientProvider>,
  );

  return screen.getByRole('combobox', { name: 'Recherche globale' });
}

function saisir(champ: HTMLElement, texte: string): void {
  fireEvent.focus(champ);
  fireEvent.change(champ, { target: { value: texte } });
}

describe('BarreRecherche', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    pousser.mockReset();
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  it('ne cherche rien à moins de deux caractères', async () => {
    repondre([]);
    saisir(afficher(), 'a');

    await waitFor(() => expect(vi.mocked(fetch)).not.toHaveBeenCalled());
  });

  it('affiche les résultats à partir de deux caractères', async () => {
    repondre([SULTAN, DOSSIER]);
    saisir(afficher(), '8K');

    expect(await screen.findByText('8KLM204')).toBeInTheDocument();
    expect(screen.getByText('Morales')).toBeInTheDocument();
  });

  it('ouvre une donnée par sa fiche', async () => {
    repondre([SULTAN]);
    saisir(afficher(), '8K');

    fireEvent.click(await screen.findByText('8KLM204'));

    expect(pousser).toHaveBeenCalledWith('/entites/e-sultan');
  });

  it('ouvre un dossier par sa route, qui redirige vers le pivot', async () => {
    repondre([DOSSIER]);
    saisir(afficher(), 'Mor');

    fireEvent.click(await screen.findByText('Morales'));

    expect(pousser).toHaveBeenCalledWith('/dossiers/d-morales');
  });

  it('porte la visibilité en texte, jamais en couleur seule', async () => {
    repondre([DOSSIER]);
    saisir(afficher(), 'Mor');

    expect(await screen.findByText('restreint')).toBeInTheDocument();
  });

  it('dit ce qu’il a cherché quand rien ne ressort', async () => {
    repondre([]);
    saisir(afficher(), 'zz');

    expect(
      await screen.findByText(/dans ce que vous pouvez consulter/),
    ).toBeInTheDocument();
  });

  it('se pilote au clavier', async () => {
    repondre([SULTAN, DOSSIER]);

    const champ = afficher();
    saisir(champ, '8K');
    await screen.findByText('8KLM204');

    fireEvent.keyDown(champ, { key: 'ArrowDown' });
    fireEvent.keyDown(champ, { key: 'Enter' });

    expect(pousser).toHaveBeenCalledWith('/dossiers/d-morales');
  });
});
