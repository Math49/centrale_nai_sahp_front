'use client';

import Image from 'next/image';

import styles from './chargement.module.css';

/** Écusson de la Gang Task Force, tel que fourni. */
const SOURCE = '/images/logos/logo_gtf.png';

/**
 * Écran d'attente — l'écusson qui tourne sur lui-même, et rien d'autre.
 *
 * Rien d'autre est délibéré : une barre de progression mentirait, faute de
 * savoir ce qu'elle mesure, et un message ferait lire là où il n'y a qu'à
 * patienter. L'écusson est circulaire, donc la rotation ne déplace aucun
 * contour — c'est le seul mouvement qui ne demande rien à l'œil.
 *
 * Le texte de relève reste présent pour les lecteurs d'écran, à qui une image
 * qui tourne ne dit rien du tout.
 */
export function EcranChargement() {
  return (
    <div className={styles.ecran} role="status" aria-live="polite">
      <Image
        className={styles.rotor}
        src={SOURCE}
        alt=""
        width={132}
        height={125}
        priority
      />
      <span className={styles.releve}>Chargement…</span>
    </div>
  );
}
