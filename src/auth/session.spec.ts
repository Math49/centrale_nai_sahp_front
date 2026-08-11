import { beforeEach, describe, expect, it, vi } from 'vitest';

import { magasinSession, type AgentConnecte } from './session';

const AGENT: AgentConnecte = {
  id: '9d6f2c1e-0000-4000-8000-000000000001',
  matricule: '2291',
  prenom: 'Mathis',
  nom: 'Mercier',
  roleCode: 'etat_major',
  superAdmin: true,
  doitChangerMdp: false,
  permissions: ['agent.gerer'],
};

describe('magasinSession', () => {
  beforeEach(() => {
    magasinSession.fermer('volontaire');
    magasinSession.oublierRaison();
  });

  it('part vide', () => {
    expect(magasinSession.lire()).toEqual({
      agent: null,
      raisonFermeture: null,
    });
  });

  it('ouvre une session sur la seule identité de l’agent', () => {
    magasinSession.ouvrir(AGENT);

    expect(magasinSession.lire().agent?.matricule).toBe('2291');
  });

  it('retient la raison de fermeture, pour que la connexion puisse la dire', () => {
    magasinSession.ouvrir(AGENT);
    magasinSession.fermer('expiration');

    expect(magasinSession.lire()).toEqual({
      agent: null,
      raisonFermeture: 'expiration',
    });
  });

  it('n’est prête qu’une fois l’API interrogée', () => {
    expect(magasinSession.estPrete()).toBe(true);

    magasinSession.reprendre(AGENT);

    expect(magasinSession.estPrete()).toBe(true);
    expect(magasinSession.lire().agent?.matricule).toBe('2291');
  });

  it('prévient ses abonnés à chaque changement', () => {
    const prevenir = vi.fn();
    const desabonner = magasinSession.abonner(prevenir);

    magasinSession.ouvrir(AGENT);
    expect(prevenir).toHaveBeenCalledTimes(1);

    magasinSession.fermer('volontaire');
    expect(prevenir).toHaveBeenCalledTimes(2);

    desabonner();
    magasinSession.ouvrir(AGENT);
    expect(prevenir).toHaveBeenCalledTimes(2);
  });

  it('ne prévient pas pour une fermeture sans session ouverte', () => {
    const prevenir = vi.fn();
    magasinSession.abonner(prevenir);

    magasinSession.fermer('expiration');

    expect(prevenir).not.toHaveBeenCalled();
  });

  it('ne met jamais le jeton dans l’etat expose ni dans le navigateur', () => {
    magasinSession.ouvrir(AGENT, 'jeton-en-memoire');

    expect(JSON.stringify(magasinSession.lire())).not.toMatch(/jeton/i);
    expect(magasinSession.lireJeton()).toBe('jeton-en-memoire');
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });
});
