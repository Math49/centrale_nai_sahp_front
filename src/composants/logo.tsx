import Image from 'next/image';
import type { CSSProperties } from 'react';

import styles from './logo.module.css';

/** Badge officiel de l'unité, tel que fourni. */
const SOURCE = '/images/logos/logo_nai.png';

/** Rapport largeur/hauteur du fichier, 482 × 454. */
const RATIO = 482 / 454;

/**
 * Badge SAHP Narcotics.
 *
 * Le sceau est **posé sur une plaque claire**, et ce n'est pas une coquetterie :
 * près des deux tiers de ses pixels opaques sont sous une luminance de 70,
 * c'est-à-dire noirs. Sur une interface dont le fond est `#08090b`, l'étoile
 * disparaîtrait et il ne resterait que le disque gravé — un badge réduit à son
 * trou. La plaque rend la silhouette, qui *est* la marque.
 *
 * `taille` désigne la plaque, pas le sceau : c'est elle qui occupe la place
 * dans la mise en page, et raisonner sur le contenu ferait sauter les alignements
 * à chaque changement de fourrure.
 */
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
