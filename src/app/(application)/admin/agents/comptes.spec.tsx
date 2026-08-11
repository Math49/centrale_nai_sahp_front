import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { magasinSession, type AgentConnecte } from '@/auth/session';
import PageAgents from './page';

const MOI: AgentConnecte = {
  id: '11111111-0000-4000-8000-000000000001',
  matricule: '43',
  prenom: 'Math',
  nom: 'Daniel',
  roleCode: 'etat_major',
  superAdmin: true,
  doitChangerMdp: false,
  permissions: ['agent.gerer', 'agent.anonymiser'],
};

const AUTRE = {
  id: '22222222-0000-4000-8000-000000000002',
  matricule: 'si-003',
  prenom: 'Noa',
  nom: 'Duval',
  libelle: 'Noa Duval',
  roleId: '33333333-0000-4000-8000-000000000003',
  roleCode: 'senior_investigator',
  roleLibelle: 'Senior Investigator',
  superAdmin: false,
  actif: true,
  doitChangerMdp: false,
  anonymise: false,
  anonymiseLe: null,
  creeLe: '2026-01-04T10:00:00.000Z',
};

const GRADES = [
  {
    id: AUTRE.roleId,
    code: 'senior_investigator',
    libelle: 'Senior Investigator',
    permissions: ['entite.creer'],
    ordre: 2,
  },
];

const envois: { url: string; corps: unknown }[] = [];

function repondre(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (requete: Request) => {
      const url = requete.url;
      const methode = requete.method;

      if (methode !== 'GET') {
        const texte = await requete.clone().text();
        envois.push({ url, corps: texte ? JSON.parse(texte) : null });
      }

      const json = (charge: unknown, statut = 200) =>
        new Response(JSON.stringify(charge), {
          status: statut,
          headers: { 'content-type': 'application/json' },
        });

      if (url.includes('/roles')) {
        return json(GRADES);
      }

      if (url.includes('/anonymiser')) {
        return json({ ...AUTRE, anonymise: true });
      }

      if (methode === 'POST' && url.endsWith('/agents')) {
        return json(
          {
            agent: { ...AUTRE, id: '44444444-0000-4000-8000-000000000004' },
            motDePasseProvisoire: 'coriandre-plateau-9741',
          },
          201,
        );
      }

      if (methode === 'PATCH') {
        return json(AUTRE);
      }

      return json([AUTRE]);
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
      <PageAgents />
    </QueryClientProvider>,
  );
}

describe('Comptes agents', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    envois.length = 0;
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  it('n’offre aucun bouton qui dise « supprimer »', async () => {
    afficher();

    await screen.findByText('Noa Duval');

    for (const bouton of screen.getAllByRole('button')) {
      expect(bouton.textContent?.toLowerCase()).not.toContain('supprim');
    }
  });

  it('montre le mot de passe provisoire et n’en laisse sortir que par un acquittement', async () => {
    afficher();

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir un compte' }));

    fireEvent.change(screen.getByLabelText(/^Matricule/), {
      target: { value: 'ji-010' },
    });
    fireEvent.change(screen.getByLabelText(/^Prénom/), {
      target: { value: 'Lena' },
    });
    fireEvent.change(screen.getByLabelText(/^Nom/), {
      target: { value: 'Ferrand' },
    });

    await screen.findByRole('option', { name: 'Senior Investigator' });
    fireEvent.change(screen.getByLabelText('Grade'), {
      target: { value: AUTRE.roleId },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir le compte' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir' }));

    await screen.findByText('coriandre-plateau-9741');

    const boite = screen.getByRole('dialog');
    expect(
      [...boite.querySelectorAll('button')].map((bouton) => bouton.textContent),
    ).not.toContain('Annuler');
  });

  it('n’envoie jamais de mot de passe choisi par l’administrateur', async () => {
    afficher();

    fireEvent.click(screen.getByRole('button', { name: 'Ouvrir un compte' }));

    expect(screen.queryByLabelText(/mot de passe/i)).toBeNull();
  });

  it('garde l’anonymisation fermée tant que le matricule n’est pas saisi', async () => {
    afficher();

    fireEvent.click(await screen.findByRole('button', { name: /Noa Duval/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Anonymiser' }));

    const confirmer = screen.getByRole('button', {
      name: 'Anonymiser définitivement',
    });
    expect(confirmer).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Saisir/), {
      target: { value: 'si-003' },
    });
    expect(confirmer).toBeEnabled();

    fireEvent.click(confirmer);

    await waitFor(() =>
      expect(
        envois.some((envoi) => envoi.url.includes('/anonymiser')),
      ).toBeTruthy(),
    );
  });

  it('n’envoie que les champs modifiés', async () => {
    afficher();

    fireEvent.click(await screen.findByRole('button', { name: /Noa Duval/ }));

    fireEvent.change(screen.getByLabelText(/^Prénom/), {
      target: { value: 'Noah' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => expect(envois.length).toBeGreaterThan(0));
    expect(envois[0].corps).toEqual({ prenom: 'Noah' });
  });
});
