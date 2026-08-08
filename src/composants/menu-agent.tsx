'use client';

import { deconnecter, useSession } from '@/auth/use-session';
import styles from './menu-agent.module.css';

export function MenuAgent() {
  const { agent } = useSession();

  if (!agent) {
    return null;
  }

  return (
    <div className={styles.bloc}>
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
        onClick={deconnecter}
      >
        Se déconnecter
      </button>
    </div>
  );
}
