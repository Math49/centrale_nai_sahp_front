import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { magasinSession, type AgentConnecte } from '@/auth/session';
import { Coquille } from './coquille';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',

  useRouter: () => ({ push: vi.fn() }),
}));

const JUNIOR: AgentConnecte = {
  id: '9d6f2c1e-0000-4000-8000-000000000002',
  matricule: 'ji-003',
  prenom: 'Tyron',
  nom: 'Banks',
  roleCode: 'junior_investigator',
  superAdmin: false,
  doitChangerMdp: false,
  permissions: ['entite.creer', 'fait.creer'],
};

function afficher() {
  const client = new QueryClient();

  return render(
    <QueryClientProvider client={client}>
      <Coquille>
        <p>contenu</p>
      </Coquille>
    </QueryClientProvider>,
  );
}

describe('Coquille', () => {
  beforeEach(() => {
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  it('affiche les quatre zones ouvertes à tous', () => {
    magasinSession.ouvrir(JUNIOR);
    afficher();

    for (const zone of ['Accueil', 'Dossiers', 'Données', 'Graphe']) {
      expect(screen.getByRole('link', { name: zone })).toBeInTheDocument();
    }
  });

  it("masque l'administration à un junior", () => {
    magasinSession.ouvrir(JUNIOR);
    afficher();

    expect(
      screen.queryByRole('link', { name: 'Administration' }),
    ).not.toBeInTheDocument();
  });

  it("ouvre l'administration à qui détient une seule de ses permissions", () => {
    magasinSession.ouvrir({
      ...JUNIOR,
      permissions: ['journal.consulter'],
    });
    afficher();

    expect(
      screen.getByRole('link', { name: 'Administration' }),
    ).toBeInTheDocument();
  });

  it("ouvre l'administration à qui peut archiver, pour la seule liste des orphelines", () => {
    magasinSession.ouvrir({
      ...JUNIOR,
      roleCode: 'senior_investigator',
      permissions: ['entite.creer', 'entite.archiver'],
    });
    afficher();

    expect(
      screen.getByRole('link', { name: 'Administration' }),
    ).toBeInTheDocument();
  });

  it("ouvre l'administration à un super-admin sans permission déclarée", () => {
    magasinSession.ouvrir({
      ...JUNIOR,
      superAdmin: true,
      permissions: [],
    });
    afficher();

    expect(
      screen.getByRole('link', { name: 'Administration' }),
    ).toBeInTheDocument();
  });

  it('affiche le matricule en monospace', () => {
    magasinSession.ouvrir(JUNIOR);
    afficher();

    expect(screen.getByText('ji-003')).toHaveClass('mono');
  });

  it('garde la recherche globale présente sur tout écran', () => {
    magasinSession.ouvrir(JUNIOR);
    afficher();

    expect(
      screen.getByRole('combobox', { name: 'Recherche globale' }),
    ).toBeInTheDocument();
  });
});
