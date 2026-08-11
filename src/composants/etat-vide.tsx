import type { ReactNode } from 'react';

import styles from './etat-vide.module.css';

export function EtatVide({
  titre,
  explication,
  action,
}: {
  titre: string;
  explication?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.bloc}>
      <p className={styles.titre}>{titre}</p>
      {explication && <p className={styles.explication}>{explication}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
