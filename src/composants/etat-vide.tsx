import type { ReactNode } from 'react';

import styles from './etat-vide.module.css';

/**
 * État vide — formulé comme une invitation, avec l'action directement dessous.
 *
 * Jamais « aucun résultat » sec : l'absence d'information est elle-même une
 * information, et l'écran doit dire quoi en faire.
 */
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
