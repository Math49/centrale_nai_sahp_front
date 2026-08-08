import type { components } from '@/api/contrat';

export type AgentConnecte = components['schemas']['AgentConnecteDto'];

export type RaisonFermeture = 'volontaire' | 'expiration';

export interface EtatSession {
  jeton: string | null;
  agent: AgentConnecte | null;
  raisonFermeture: RaisonFermeture | null;
}

const VIDE: EtatSession = { jeton: null, agent: null, raisonFermeture: null };

/**
 * Session en mémoire, hors de React.
 *
 * **Le jeton n'est jamais écrit sur le disque** — ni `localStorage`, ni
 * `sessionStorage`, ni cookie. Un rechargement de page déconnecte, ce qui est
 * assumé : la plateforme sert à consulter des enquêtes depuis un poste partagé,
 * et un jeton persisté y survivrait à l'agent qui s'en va.
 *
 * Le magasin vit hors de React parce que l'intercepteur de requêtes doit lire
 * le jeton sans être un composant.
 */
let etat: EtatSession = VIDE;

const abonnes = new Set<() => void>();

function publier(nouvel: EtatSession): void {
  etat = nouvel;
  abonnes.forEach((prevenir) => prevenir());
}

export const magasinSession = {
  lire: (): EtatSession => etat,

  ouvrir(jeton: string, agent: AgentConnecte): void {
    publier({ jeton, agent, raisonFermeture: null });
  },

  /** Met à jour l'agent sans toucher au jeton — après un changement de grade. */
  rafraichirAgent(agent: AgentConnecte): void {
    if (!etat.jeton) {
      return;
    }
    publier({ ...etat, agent });
  },

  /** Remplace jeton et agent d'un bloc — après un changement de mot de passe,
   *  qui invalide l'ancien jeton et en renvoie un neuf. */
  renouveler(jeton: string, agent: AgentConnecte): void {
    publier({ jeton, agent, raisonFermeture: null });
  },

  fermer(raison: RaisonFermeture): void {
    if (!etat.jeton && !etat.agent) {
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
