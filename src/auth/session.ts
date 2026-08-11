import type { components } from '@/api/contrat';

export type AgentConnecte = components['schemas']['AgentConnecteDto'];

export type RaisonFermeture = 'volontaire' | 'expiration';

export interface EtatSession {
  agent: AgentConnecte | null;
  raisonFermeture: RaisonFermeture | null;
}

const VIDE: EtatSession = { agent: null, raisonFermeture: null };

let etat: EtatSession = VIDE;

let jeton: string | null = null;

let pret = false;

const abonnes = new Set<() => void>();

function publier(nouvel: EtatSession): void {
  etat = nouvel;
  abonnes.forEach((prevenir) => prevenir());
}

export const magasinSession = {
  lire: (): EtatSession => etat,

  lireJeton: (): string | null => jeton,

  estPrete: (): boolean => pret,

  reprendre(agent: AgentConnecte | null): void {
    pret = true;

    if (agent) {
      etat = { agent, raisonFermeture: null };
    }

    abonnes.forEach((prevenir) => prevenir());
  },

  ouvrir(agent: AgentConnecte, nouveauJeton?: string): void {
    pret = true;

    if (nouveauJeton) {
      jeton = nouveauJeton;
    }

    publier({ agent, raisonFermeture: null });
  },

  rafraichirAgent(agent: AgentConnecte): void {
    publier({ ...etat, agent });
  },

  fermer(raison: RaisonFermeture): void {
    pret = true;
    jeton = null;

    if (!etat.agent) {
      return;
    }

    publier({ ...VIDE, raisonFermeture: raison });
  },

  oublierRaison(): void {
    if (etat.raisonFermeture === null) {
      return;
    }
    publier({ ...etat, raisonFermeture: null });
  },

  abonner(prevenir: () => void): () => void {
    abonnes.add(prevenir);
    return () => abonnes.delete(prevenir);
  },
};
