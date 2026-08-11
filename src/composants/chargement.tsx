'use client';

import Image from 'next/image';

import styles from './chargement.module.css';

const SOURCE = '/images/logos/logo_gtf.png';

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
