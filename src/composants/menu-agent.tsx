'use client';

import { deconnecter, useSession } from '@/auth/use-session';
import { Icone } from './icones';
import styles from './menu-agent.module.css';

/** Initiales de l'agent, pour la pastille d'identité. */
function initiales(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function MenuAgent() {
  const { agent } = useSession();

  if (!agent) {
    return null;
  }

  return (
    <div className={styles.bloc}>
      <span className={styles.pastille} aria-hidden="true">
        {initiales(agent.prenom, agent.nom)}
      </span>

      <div className={styles.identite}>
        <span className={styles.nom}>
          {agent.prenom} {agent.nom}
        </span>
        <span className={styles.grade}>
          {/* Le matricule est un identifiant : monospace, comme les plaques. */}
          <span className="mono">{agent.matricule}</span>
          {agent.superAdmin && (
            <>
              {' · '}
              <span className={styles.superAdmin}>super-admin</span>
            </>
          )}
        </span>
      </div>

      <button
        type="button"
        className={styles.deconnexion}
        onClick={() => void deconnecter()}
        title="Se déconnecter"
        aria-label="Se déconnecter"
      >
        <Icone nom="sortie" taille={16} />
      </button>
    </div>
  );
}
