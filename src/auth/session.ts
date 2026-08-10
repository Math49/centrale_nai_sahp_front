import type { components } from '@/api/contrat';

export type AgentConnecte = components['schemas']['AgentConnecteDto'];

export type RaisonFermeture = 'volontaire' | 'expiration';

export interface EtatSession {
  agent: AgentConnecte | null;
  raisonFermeture: RaisonFermeture | null;
}

const VIDE: EtatSession = { agent: null, raisonFermeture: null };

/**
 * Session de l'agent, tenue hors de React.
 *
 * **Le front ne détient plus le jeton.** Il vit dans un cookie `httpOnly` posé
 * par l'API : le navigateur l'envoie seul sur chaque requête, et aucun script
 * de la page ne peut le lire — une faille XSS ne l'exfiltre donc pas.
 *
 * Ce magasin ne retient que l'identité de l'agent, qui sert à l'affichage et au
 * masquage des zones. Il n'est **jamais** ce qui autorise quoi que ce soit :
 * l'API refuse d'elle-même, sans rien croire de ce qui vient du navigateur.
 *
 * Au démarrage, le front ne peut pas savoir s'il a une session — le cookie lui
 * est invisible. Il le demande : `GET /auth/moi`. C'est `reprendre()`.
 */
let etat: EtatSession = VIDE;

/**
 * La session a-t-elle été cherchée auprès de l'API ?
 *
 * Faux tant que la question n'a pas reçu de réponse. Sans ce drapeau, le garde
 * verrait une session vide et renverrait vers la connexion avant même d'avoir
 * demandé.
 */
let pret = false;

const abonnes = new Set<() => void>();

function publier(nouvel: EtatSession): void {
  etat = nouvel;
  abonnes.forEach((prevenir) => prevenir());
}

export const magasinSession = {
  lire: (): EtatSession => etat,

  /** L'API a-t-elle déjà répondu sur l'existence d'une session ? */
  estPrete: (): boolean => pret,

  /** Enregistre le résultat de l'interrogation initiale, session ou non. */
  reprendre(agent: AgentConnecte | null): void {
    pret = true;

    if (agent) {
      etat = { agent, raisonFermeture: null };
    }

    abonnes.forEach((prevenir) => prevenir());
  },

  ouvrir(agent: AgentConnecte): void {
    pret = true;
    publier({ agent, raisonFermeture: null });
  },

  /** Met à jour l'agent — après un changement de grade ou de mot de passe. */
  rafraichirAgent(agent: AgentConnecte): void {
    publier({ ...etat, agent });
  },

  fermer(raison: RaisonFermeture): void {
    pret = true;

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
