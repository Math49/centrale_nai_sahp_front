import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AgentConnecte } from './session';

const remplacer = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: remplacer }),
}));

const AGENT: AgentConnecte = {
  id: '9d6f2c1e-0000-4000-8000-000000000007',
  matricule: 'ji-003',
  prenom: 'Tyron',
  nom: 'Banks',
  roleCode: 'junior_investigator',
  superAdmin: false,
  doitChangerMdp: false,
  permissions: [],
};

async function charger() {
  vi.resetModules();

  const { magasinSession } = await import('./session');
  const { GardeSession } = await import('./garde-session');

  return { magasinSession, GardeSession };
}

describe('GardeSession', () => {
  beforeEach(() => {
    remplacer.mockClear();
  });

  it('montre l’écran d’attente tant que l’API n’a pas répondu, jamais un blanc', async () => {
    const { GardeSession } = await charger();

    const { container } = render(
      <GardeSession>
        <p>contenu</p>
      </GardeSession>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('contenu')).toBeNull();
    expect(container).not.toBeEmptyDOMElement();
    expect(remplacer).not.toHaveBeenCalled();
  });

  it('rend le contenu une fois la session ouverte', async () => {
    const { magasinSession, GardeSession } = await charger();
    magasinSession.ouvrir(AGENT);

    render(
      <GardeSession>
        <p>contenu</p>
      </GardeSession>,
    );

    expect(screen.getByText('contenu')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('attend derrière l’écran, sans rien laisser voir, quand il faut rediriger', async () => {
    const { magasinSession, GardeSession } = await charger();
    magasinSession.reprendre(null);

    render(
      <GardeSession>
        <p>contenu</p>
      </GardeSession>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('contenu')).toBeNull();
    expect(remplacer).toHaveBeenCalledWith('/connexion');
  });
});
