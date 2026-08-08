import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { magasinSession, type AgentConnecte } from '@/auth/session';
import { api } from './client';

const AGENT: AgentConnecte = {
  id: '9d6f2c1e-0000-4000-8000-000000000001',
  matricule: '2291',
  prenom: 'Mathis',
  nom: 'Mercier',
  roleCode: 'etat_major',
  superAdmin: false,
  doitChangerMdp: false,
  permissions: [],
};

function repondre(statut: number): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 'peu importe' }), {
          status: statut,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    ),
  );
}

describe('client API', () => {
  beforeEach(() => {
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('porte le jeton en en-tête Authorization', async () => {
    magasinSession.ouvrir('jeton-a', AGENT);
    repondre(200);

    await api.GET('/agents');

    const appel = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(appel.headers.get('Authorization')).toBe('Bearer jeton-a');
  });

  it("n'envoie pas d'en-tête quand aucune session n'est ouverte", async () => {
    repondre(200);

    await api.POST('/auth/login', {
      body: { matricule: '2291', motDePasse: 'x' },
    });

    const appel = vi.mocked(fetch).mock.calls[0][0] as Request;
    expect(appel.headers.has('Authorization')).toBe(false);
  });

  describe('expiration', () => {
    it('ferme la session sur un 401 hors authentification', async () => {
      magasinSession.ouvrir('jeton-a', AGENT);
      repondre(401);

      await api.GET('/agents');

      expect(magasinSession.lire().jeton).toBeNull();
      expect(magasinSession.lire().raisonFermeture).toBe('expiration');
    });

    it('ne ferme pas la session sur un 401 de /auth/mot-de-passe', async () => {
      // Un ancien mot de passe erroné ne doit pas déconnecter l'agent : il
      // perdrait sa session pour une faute de frappe.
      magasinSession.ouvrir('jeton-a', AGENT);
      repondre(401);

      await api.POST('/auth/mot-de-passe', {
        body: { ancien: 'faux', nouveau: 'un-nouveau-mot-de-passe' },
      });

      expect(magasinSession.lire().jeton).toBe('jeton-a');
    });

    it('ne ferme rien sur un 401 de connexion', async () => {
      repondre(401);

      await api.POST('/auth/login', {
        body: { matricule: '2291', motDePasse: 'faux' },
      });

      expect(magasinSession.lire().raisonFermeture).toBeNull();
    });

    it('laisse la session ouverte sur un 403', async () => {
      // Un refus de permission n'est pas une expiration : le jeton reste bon.
      magasinSession.ouvrir('jeton-a', AGENT);
      repondre(403);

      await api.GET('/agents');

      expect(magasinSession.lire().jeton).toBe('jeton-a');
    });
  });
});
