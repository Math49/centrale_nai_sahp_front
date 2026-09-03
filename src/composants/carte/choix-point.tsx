'use client';

import { useState } from 'react';

import { useTypesReperes } from '@/api/carte';
import controles from '../controles.module.css';
import { IconeFontAwesome } from '../icone-fontawesome';
import styles from './choix-point.module.css';
import { estSurLePlan, libelleDuPoint, type PointPlan } from './fond';
import { ToileCarte } from './toile-carte';

/**
 * Couleur d'un point dont personne n'a choisi la teinte.
 *
 * Elle double `ACCENT` du back, qui l'applique à l'écriture : les deux doivent
 * dire la même chose, sans quoi un point changerait de couleur en revenant de
 * l'API.
 */
export const COULEUR_PAR_DEFAUT = '#6f9dc4';

/** Palette d'ouverture — assez de teintes pour distinguer, pas assez pour hésiter. */
const PALETTE = [
  '#6f9dc4',
  '#d99a5b',
  '#c96f6f',
  '#6cc08a',
  '#b48ac4',
  '#d4c05a',
  '#8a8f98',
];

/**
 * Un point tel qu'une fiche le porte.
 *
 * Plus que deux coordonnées : le type dit **ce qu'on a posé là**, la couleur
 * **comment on le signale**. Les deux sont facultatifs — un point posé avant
 * que ce choix existe reste un point, et un service qui n'a défini aucun type
 * doit pouvoir en poser un.
 */
export interface PointSaisi extends PointPlan {
  typeRepereId: string | null;
  couleur: string;
}

/**
 * Poser un point sur le plan.
 *
 * Un clic pose, un autre déplace : pas de mode, pas de bouton à armer. Le point
 * posé se lit aussi en toutes lettres sous la carte — un identifiant se lit
 * toujours, et deux positions voisines ne se distinguent pas à l'œil.
 *
 * **Ce composant ne se met pas dans un `<label>`.** Un `<label>` renvoie chaque
 * clic qu'il reçoit vers la commande qu'il étiquette : le clic destiné au plan
 * repartait vers « Retirer le point », et le point ne se posait jamais.
 */
export function ChoixPoint({
  valeur,
  onChange,
  hauteur = '320px',
}: {
  valeur: unknown;
  onChange: (valeur: PointSaisi | null) => void;
  hauteur?: string;
}) {
  const types = useTypesReperes();
  const point = lirePoint(valeur);

  /*
   * Le type et la couleur, avant même qu'un point existe.
   *
   * On choisit ce qu'on va poser, puis on le pose : ne garder ce choix que dans
   * la valeur le perdrait tant qu'aucun clic n'a eu lieu, et l'agent devrait le
   * refaire après coup.
   */
  const [marque, definirMarque] = useState(() => {
    const depart = lirePoint(valeur);

    return {
      typeRepereId: depart?.typeRepereId ?? null,
      couleur: depart?.couleur ?? COULEUR_PAR_DEFAUT,
    };
  });

  /*
   * Le cadrage initial, et lui seul.
   *
   * Recentrer à chaque pose ferait sauter le plan sous le doigt : l'agent
   * clique quelque part sur la carte entière, et se retrouve zoomé au niveau 5
   * sur son propre clic, sans repère alentour. On cadre sur le point **déjà
   * enregistré** à l'ouverture — c'est là que c'est utile — puis on laisse la
   * vue tranquille.
   */
  const [cadrageInitial] = useState(() => {
    const depart = lirePoint(valeur);
    return depart ? [depart] : undefined;
  });

  // Un point de fiche est un point : les types de zone n'ont rien à y faire.
  const typesPosables = (types.data ?? []).filter(
    (type) => type.nature === 'point',
  );

  const typeChoisi = typesPosables.find(
    (type) => type.id === marque.typeRepereId,
  );

  const reglerMarque = (suivante: Partial<typeof marque>): void => {
    const fusion = { ...marque, ...suivante };
    definirMarque(fusion);

    // Le point déjà posé suit le réglage sans qu'on ait à le reposer.
    if (point) {
      onChange({ x: point.x, y: point.y, ...fusion });
    }
  };

  return (
    <div className={styles.cadre}>
      {typesPosables.length > 0 && (
        <div className={styles.reglages}>
          <span className={controles.etiquette}>Type de point</span>

          <div className={styles.jetons}>
            <button
              type="button"
              className={styles.jeton}
              data-actif={marque.typeRepereId === null}
              onClick={() => reglerMarque({ typeRepereId: null })}
            >
              Sans type
            </button>

            {typesPosables.map((type) => (
              <button
                key={type.id}
                type="button"
                className={styles.jeton}
                data-actif={marque.typeRepereId === type.id}
                onClick={() => reglerMarque({ typeRepereId: type.id })}
              >
                <IconeFontAwesome valeur={type.icone} taille={12} />
                {type.libelle}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.reglages}>
        <span className={controles.etiquette}>Couleur du point</span>

        <div className={styles.jetons}>
          {PALETTE.map((teinte) => (
            <button
              key={teinte}
              type="button"
              className={styles.teinte}
              style={{ background: teinte }}
              data-actif={marque.couleur.toLowerCase() === teinte}
              aria-label={`Couleur ${teinte}`}
              onClick={() => reglerMarque({ couleur: teinte })}
            />
          ))}

          <input
            type="color"
            className={styles.pipette}
            value={marque.couleur}
            aria-label="Couleur libre"
            onChange={(evenement) =>
              reglerMarque({ couleur: evenement.target.value })
            }
          />
        </div>
      </div>

      <ToileCarte
        hauteur={hauteur}
        centreSur={cadrageInitial}
        marqueurs={
          point
            ? [
                {
                  id: 'saisi',
                  point,
                  libelle: typeChoisi?.libelle ?? 'Position saisie',
                  couleur: marque.couleur,
                  icone: typeChoisi?.icone ?? 'fas:location-dot',
                },
              ]
            : []
        }
        surClicPlan={(pose) => onChange({ ...pose, ...marque })}
      />

      <div className={styles.pied}>
        <span className={controles.remarque}>
          {point ? (
            <>
              Position : <span className="mono">{libelleDuPoint(point)}</span>
            </>
          ) : (
            'Cliquer sur le plan pour poser le point.'
          )}
        </span>

        {point && (
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => onChange(null)}
          >
            Retirer le point
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Une valeur venue de l'API est-elle un point ?
 *
 * `ChampDynamique` reçoit du `unknown` : la forme n'est connue qu'à l'exécution,
 * et une valeur écrite avant que ce type existe n'a aucune raison d'être un
 * point. On préfère ne rien afficher plutôt que d'afficher n'importe où.
 */
export function lirePoint(valeur: unknown): PointSaisi | null {
  if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) {
    return null;
  }

  const { x, y, typeRepereId, couleur } = valeur as {
    x?: unknown;
    y?: unknown;
    typeRepereId?: unknown;
    couleur?: unknown;
  };

  if (typeof x !== 'number' || typeof y !== 'number') {
    return null;
  }

  if (!estSurLePlan({ x, y })) {
    return null;
  }

  return {
    x,
    y,
    typeRepereId: typeof typeRepereId === 'string' ? typeRepereId : null,
    couleur: typeof couleur === 'string' ? couleur : COULEUR_PAR_DEFAUT,
  };
}

/** Tous les points d'une valeur, qu'elle soit simple ou multiple. */
export function lirePoints(valeur: unknown): PointSaisi[] {
  if (Array.isArray(valeur)) {
    return valeur
      .map(lirePoint)
      .filter((point): point is PointSaisi => !!point);
  }

  const point = lirePoint(valeur);

  return point ? [point] : [];
}
