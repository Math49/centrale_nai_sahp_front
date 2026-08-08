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
      jeton: null,
      agent: null,
      raisonFermeture: null,
    });
  });

  it('ouvre une session', () => {
    magasinSession.ouvrir('jeton-a', AGENT);

    expect(magasinSession.lire().jeton).toBe('jeton-a');
    expect(magasinSession.lire().agent?.matricule).toBe('2291');
  });

  it('retient la raison de fermeture, pour que la connexion puisse la dire', () => {
    magasinSession.ouvrir('jeton-a', AGENT);
    magasinSession.fermer('expiration');

    expect(magasinSession.lire()).toEqual({
      jeton: null,
      agent: null,
      raisonFermeture: 'expiration',
    });
  });

  it('remplace jeton et agent au renouvellement', () => {
    magasinSession.ouvrir('jeton-a', AGENT);
    magasinSession.renouveler('jeton-b', { ...AGENT, doitChangerMdp: false });

    expect(magasinSession.lire().jeton).toBe('jeton-b');
    expect(magasinSession.lire().raisonFermeture).toBeNull();
  });

  it('ne rafraîchit pas un agent hors session', () => {
    magasinSession.rafraichirAgent(AGENT);

    expect(magasinSession.lire().agent).toBeNull();
  });

  it('prévient ses abonnés à chaque changement', () => {
    const prevenir = vi.fn();
    const desabonner = magasinSession.abonner(prevenir);

    magasinSession.ouvrir('jeton-a', AGENT);
    expect(prevenir).toHaveBeenCalledTimes(1);

    magasinSession.fermer('volontaire');
    expect(prevenir).toHaveBeenCalledTimes(2);

    desabonner();
    magasinSession.ouvrir('jeton-b', AGENT);
    expect(prevenir).toHaveBeenCalledTimes(2);
  });

  it('ne prévient pas pour une fermeture sans session ouverte', () => {
    const prevenir = vi.fn();
    magasinSession.abonner(prevenir);

    magasinSession.fermer('expiration');

    expect(prevenir).not.toHaveBeenCalled();
  });

  it("n'écrit rien dans le stockage du navigateur", () => {
    magasinSession.ouvrir('jeton-a', AGENT);

    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });
});
