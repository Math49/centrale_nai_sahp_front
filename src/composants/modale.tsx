'use client';

import { useEffect, type ReactNode } from 'react';

import controles from './controles.module.css';
import styles from './modale.module.css';

/**
 * Modale de confirmation.
 *
 * Invariant : toute création, modification ou archivage passe par une
 * confirmation explicite. La variante récapitulative rappelle les effets et
 * l'irréversibilité ; la variante simple se contente d'une question courte.
 */
export function Modale({
  titre,
  children,
  libelleConfirmation = 'Confirmer',
  irreversible = false,
  enCours = false,
  onConfirmer,
  onAnnuler,
}: {
  titre: string;
  children?: ReactNode;
  libelleConfirmation?: string;
  irreversible?: boolean;
  enCours?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  useEffect(() => {
    const auClavier = (evenement: KeyboardEvent): void => {
      if (evenement.key === 'Escape') {
        onAnnuler();
      }
    };

    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onAnnuler]);

  return (
    <div className={styles.voile} onClick={onAnnuler}>
      <div
        className={styles.boite}
        role="dialog"
        aria-modal="true"
        aria-label={titre}
        onClick={(evenement) => evenement.stopPropagation()}
      >
        <h2 className={styles.titre}>{titre}</h2>

        {children && <div className={styles.corps}>{children}</div>}

        {irreversible && (
          <p className={styles.irreversible}>Cette action est irréversible.</p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={onAnnuler}
            disabled={enCours}
          >
            Annuler
          </button>
          <button
            type="button"
            className={controles.bouton}
            onClick={onConfirmer}
            disabled={enCours}
            autoFocus
          >
            {enCours ? 'En cours…' : libelleConfirmation}
          </button>
        </div>
      </div>
    </div>
  );
}
