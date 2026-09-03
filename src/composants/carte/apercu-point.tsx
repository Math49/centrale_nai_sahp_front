'use client';

import Link from 'next/link';

import { useTypesReperes } from '@/api/carte';
import type { PointSaisi } from './choix-point';
import styles from './choix-point.module.css';
import { libelleDuPoint } from './fond';
import { ToileCarte } from './toile-carte';

/**
 * Un point sur une fiche — le plan, centré dessus.
 *
 * Une paire de coordonnées ne dit rien à personne : c'est le plan qui situe.
 * La toile est la même que partout ailleurs, en `interactif={false}` — une
 * fiche est une lecture, et une carte qui se déplace sous le doigt volerait le
 * défilement de la page.
 *
 * Les coordonnées restent écrites dessous : un identifiant se lit toujours en
 * toutes lettres, et deux positions voisines ne se distinguent pas à l'œil.
 *
 * Un champ multiple porte plusieurs points : la vue s'élargit pour les contenir
 * tous plutôt que de n'en montrer qu'un.
 */
export function ApercuPoint({
  points,
  hauteur = '160px',
}: {
  points: PointSaisi[];
  hauteur?: string;
}) {
  const types = useTypesReperes();

  if (points.length === 0) {
    return null;
  }

  const typeDe = (id: string | null) =>
    id ? types.data?.find((candidat) => candidat.id === id) : undefined;

  // La lecture continue sur la carte du service, elle ne recommence pas.
  return (
    <span className={styles.vignette}>
      <Link
        href="/carte"
        className={styles.apercu}
        aria-label="Ouvrir la carte de la centrale"
      >
        <ToileCarte
          interactif={false}
          hauteur={hauteur}
          centreSur={points}
          marqueurs={points.map((point, rang) => {
            const type = typeDe(point.typeRepereId);

            return {
              id: `point-${rang}`,
              point,
              libelle: type?.libelle ?? libelleDuPoint(point),
              couleur: point.couleur,
              icone: type?.icone ?? 'fas:location-dot',
            };
          })}
        />
      </Link>

      <span className={`${styles.coordonnees} mono`}>
        {points.map(libelleDuPoint).join('  ·  ')}
      </span>
    </span>
  );
}
