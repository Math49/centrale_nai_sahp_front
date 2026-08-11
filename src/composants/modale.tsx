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
 *
 * `sansAnnulation` retire la sortie par le voile, par la touche d'échappement
 * et par le bouton discret. Réservé à ce qui ne s'affiche qu'une fois : un
 * clic à côté ne doit pas faire perdre un secret irrécupérable.
 */
export function Modale({
  titre,
  children,
  libelleConfirmation = 'Confirmer',
  irreversible = false,
  enCours = false,
  sansAnnulation = false,
  confirmationBloquee = false,
  onConfirmer,
  onAnnuler,
}: {
  titre: string;
  children?: ReactNode;
  libelleConfirmation?: string;
  irreversible?: boolean;
  enCours?: boolean;
  sansAnnulation?: boolean;
  /**
   * Confirmation encore fermée — le corps de la modale porte une condition que
   * l'agent n'a pas remplie. Un bouton grisé le dit ; un bouton actif qui ne
   * ferait rien laisserait croire à une panne.
   */
  confirmationBloquee?: boolean;
  onConfirmer: () => void;
  onAnnuler: () => void;
}) {
  useEffect(() => {
    if (sansAnnulation) {
      return;
    }

    const auClavier = (evenement: KeyboardEvent): void => {
      if (evenement.key === 'Escape') {
        onAnnuler();
      }
    };

    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [onAnnuler, sansAnnulation]);

  return (
    <div
      className={styles.voile}
      onClick={sansAnnulation ? undefined : onAnnuler}
    >
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
          {!sansAnnulation && (
            <button
              type="button"
              className={controles.boutonDiscret}
              onClick={onAnnuler}
              disabled={enCours}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            className={controles.bouton}
            onClick={onConfirmer}
            disabled={enCours || confirmationBloquee}
            autoFocus
          >
            {enCours ? 'En cours…' : libelleConfirmation}
          </button>
        </div>
      </div>
    </div>
  );
}
