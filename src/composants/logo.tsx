import Image from 'next/image';
import type { CSSProperties } from 'react';

import styles from './logo.module.css';

const SOURCE = '/images/logos/logo_nai.png';

const RATIO = 482 / 454;

export function Logo({ taille = 28 }: { taille?: number }) {
  const marge = Math.max(2, Math.round(taille * 0.11));
  const largeur = taille - marge * 2;
  const hauteur = Math.round(largeur / RATIO);

  return (
    <span
      className={styles.plaque}
      style={
        {
          '--taille': `${taille}px`,
          '--marge': `${marge}px`,
        } as CSSProperties
      }
    >
      <Image
        src={SOURCE}
        alt="Centrale N&I — SAHP Narcotics"
        width={largeur}
        height={hauteur}
        priority
      />
    </span>
  );
}
