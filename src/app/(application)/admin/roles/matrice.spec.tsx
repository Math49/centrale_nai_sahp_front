import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { magasinSession, type AgentConnecte } from '@/auth/session';
import PageRoles from './page';

const MOI: AgentConnecte = {
  id: '11111111-0000-4000-8000-000000000001',
  matricule: '43',
  prenom: 'Math',
  nom: 'Daniel',
  roleCode: 'etat_major',
  superAdmin: false,
  doitChangerMdp: false,
  permissions: ['role.gerer'],
};

const JUNIOR = {
  id: 'aaaaaaaa-0000-4000-8000-00000000000a',
  code: 'junior_investigator',
  libelle: 'Junior Investigator',
  permissions: ['entite.creer'],
  ordre: 1,
};

const SENIOR = {
  id: 'bbbbbbbb-0000-4000-8000-00000000000b',
  code: 'senior_investigator',
  libelle: 'Senior Investigator',
  permissions: ['entite.creer', 'fait.infirmer'],
  ordre: 2,
};

const CATALOGUE = [
  { code: 'entite.creer', libelle: 'Créer une entité' },
  { code: 'fait.infirmer', libelle: 'Infirmer un fait' },
  { code: 'journal.consulter', libelle: 'Consulter les journaux' },
];

const envois: { url: string; corps: unknown }[] = [];

function repondre(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (requete: Request) => {
      if (requete.method !== 'GET') {
        const texte = await requete.clone().text();
        envois.push({
          url: requete.url,
          corps: texte ? JSON.parse(texte) : null,
        });
      }

      const json = (charge: unknown) =>
        new Response(JSON.stringify(charge), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });

      if (requete.url.includes('catalogue-permissions')) {
        return json(CATALOGUE);
      }

      if (requete.method === 'PATCH') {
        return json(SENIOR);
      }

      return json([SENIOR, JUNIOR]);
    }),
  );
}

function afficher() {
  magasinSession.ouvrir(MOI);
  repondre();

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <PageRoles />
    </QueryClientProvider>,
  );
}

const CASE_JOURNAL_JUNIOR = 'Consulter les journaux — Junior Investigator';

describe('Rôles et permissions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    envois.length = 0;
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  it('range les grades dans leur ordre, et les gestes par famille', async () => {
    afficher();

    await screen.findByLabelText(CASE_JOURNAL_JUNIOR);

    const colonnes = screen.getAllByRole('columnheader');
    expect(colonnes.map((colonne) => colonne.textContent)).toEqual([
      'Geste',
      'Junior Investigator',
      'Senior Investigator',
    ]);

    expect(screen.getByText('Données')).toBeInTheDocument();
    expect(screen.getByText('Journaux')).toBeInTheDocument();
  });

  it('ne compte que les écarts réels : cocher puis décocher ne laisse rien', async () => {
    afficher();

    const case_ = await screen.findByLabelText(CASE_JOURNAL_JUNIOR);

    fireEvent.click(case_);
    expect(screen.getByText(/1 grade modifié/)).toBeInTheDocument();

    fireEvent.click(case_);
    expect(screen.queryByText(/grade modifié/)).toBeNull();
  });

  it('envoie le jeu complet, et seulement pour les grades touchés', async () => {
    afficher();

    fireEvent.click(await screen.findByLabelText(CASE_JOURNAL_JUNIOR));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => expect(envois.length).toBe(1));

    expect(envois[0].url).toContain(JUNIOR.id);
    expect(envois[0].corps).toEqual({
      permissions: ['entite.creer', 'journal.consulter'],
    });
  });

  it('récapitule ce qui est accordé et ce qui est retiré', async () => {
    afficher();

    fireEvent.click(await screen.findByLabelText(CASE_JOURNAL_JUNIOR));
    fireEvent.click(
      screen.getByLabelText('Infirmer un fait — Senior Investigator'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(screen.getByText(/\+ journal\.consulter/)).toBeInTheDocument();
    expect(screen.getByText(/− fait\.infirmer/)).toBeInTheDocument();
  });

  it('rappelle que le super-admin ne s’accorde par aucune case', async () => {
    afficher();

    await screen.findByLabelText(CASE_JOURNAL_JUNIOR);
    expect(
      screen.getByText(/n’est pas un grade mais un attribut du compte/),
    ).toBeInTheDocument();
  });
});
