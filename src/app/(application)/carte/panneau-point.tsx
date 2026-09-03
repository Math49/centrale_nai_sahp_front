'use client';

import Link from 'next/link';

import type { PointDeDonnee } from '@/api/carte';
import { libelleDuPoint } from '@/composants/carte/fond';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { Icone } from '@/composants/icones';
import { PastilleFiabilite, PastilleVisibilite } from '@/composants/pastilles';
import styles from './carte.module.css';

/**
 * Un point porté par une fiche, ouvert sur la carte.
 *
 * Ce n'est **pas** un repère du service : il ne se reprend ni ne s'archive
 * d'ici. C'est un fait, il appartient à sa fiche, et c'est là qu'il se corrige
 * — avec sa source, sa fiabilité et sa date, comme n'importe quelle autre
 * donnée. Le panneau ne fait donc que dire ce qu'il est et où le reprendre.
 *
 * Il existe parce que le clic était mort : un marqueur qui ne répond à rien
 * passe pour une panne.
 */
export function PanneauPoint({
  point,
  surFermeture,
}: {
  point: PointDeDonnee;
  surFermeture: () => void;
}) {
  return (
    <aside className={styles.panneau}>
      <div className={styles.entete}>
        <div>
          <h2 className={styles.titre}>
            <span
              className={styles.pastille}
              style={{ background: point.couleur, marginRight: 8 }}
            >
              <IconeFontAwesome valeur={point.icone} taille={11} />
            </span>
            {point.entiteLibelle}
          </h2>
          <p className={styles.sousTitre}>
            {point.champLibelle}
            {point.typeRepereLibelle
              ? ` · ${point.typeRepereLibelle}`
              : ''} ·{' '}
            <span className="mono">{libelleDuPoint(point.point)}</span>
          </p>
        </div>

        <button
          type="button"
          className={styles.fermer}
          onClick={surFermeture}
          aria-label="Fermer"
        >
          <Icone nom="fermer" taille={16} />
        </button>
      </div>

      <div className={styles.jetons}>
        <PastilleFiabilite niveau={point.fiabilite} />
        <PastilleVisibilite niveau={point.visibilite} />
      </div>

      <p className={styles.sousTitre}>
        Ce point est un <strong>fait</strong> porté par une fiche : il se
        corrige là où il a été saisi, avec sa source et sa date.
      </p>

      <div className={styles.actions}>
        <Link href={`/entites/${point.entiteId}`} className={styles.lienFiche}>
          Ouvrir la fiche
        </Link>
      </div>
    </aside>
  );
}
