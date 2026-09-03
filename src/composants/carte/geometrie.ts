/**
 * Les formes que la centrale sait poser sur son plan.
 *
 * Trois, et pas une de plus : un point, un rectangle, un rond. Le polygone
 * libre a existé et a disparu — on le traçait sommet par sommet, ce que
 * personne ne faisait, et il rendait chaque zone difficile à corriger. Deux
 * clics suffisent maintenant à chacune des trois.
 *
 * Toutes les coordonnées sont **normalisées entre 0 et 1**, comme partout
 * ailleurs. La conversion vers Leaflet ne vit que dans `fond.ts`.
 */

import { estSurLePlan, type PointPlan } from './fond';

export type Geometrie =
  | ({ type: 'point' } & PointPlan)
  | { type: 'rectangle'; a: PointPlan; b: PointPlan }
  | { type: 'cercle'; centre: PointPlan; rayon: number };

/** Ce qu'une zone peut être. La nature « zone » ne dit pas laquelle. */
export type FormeZone = 'rectangle' | 'cercle';

export const LIBELLES_FORME: Record<FormeZone, string> = {
  rectangle: 'Rectangle',
  cercle: 'Rond',
};

/**
 * L'icône de chaque forme.
 *
 * Un carré et un rond disent la forme mieux que deux mots, et se comparent
 * d'un coup d'œil quand ils sont côte à côte — ce qui est exactement l'usage :
 * basculer de l'un à l'autre en cours de pose.
 */
export const ICONES_FORME: Record<FormeZone, string> = {
  rectangle: 'fas:square',
  cercle: 'fas:circle',
};

/**
 * Une géométrie venue de l'API en est-elle une ?
 *
 * L'API renvoie du `unknown` : la forme n'est connue qu'à l'exécution. On
 * préfère ne rien dessiner plutôt que dessiner n'importe où.
 */
export function lireGeometrie(valeur: unknown): Geometrie | null {
  if (typeof valeur !== 'object' || valeur === null || Array.isArray(valeur)) {
    return null;
  }

  const forme = valeur as Record<string, unknown>;

  if (forme.type === 'point') {
    const point = lirePointBrut(forme);
    return point ? { type: 'point', ...point } : null;
  }

  if (forme.type === 'rectangle') {
    const a = lirePointBrut(forme.a);
    const b = lirePointBrut(forme.b);
    return a && b ? { type: 'rectangle', a, b } : null;
  }

  if (forme.type === 'cercle') {
    const centre = lirePointBrut(forme.centre);
    const { rayon } = forme;

    if (!centre || typeof rayon !== 'number' || !Number.isFinite(rayon)) {
      return null;
    }

    return { type: 'cercle', centre, rayon };
  }

  return null;
}

function lirePointBrut(valeur: unknown): PointPlan | null {
  if (typeof valeur !== 'object' || valeur === null) {
    return null;
  }

  const { x, y } = valeur as { x?: unknown; y?: unknown };

  if (typeof x !== 'number' || typeof y !== 'number') {
    return null;
  }

  const point = { x, y };

  return estSurLePlan(point) ? point : null;
}

/** Les points sur lesquels cadrer la vue pour qu'une forme tienne à l'écran. */
export function pointsDeCadrage(geometrie: Geometrie): PointPlan[] {
  if (geometrie.type === 'point') {
    return [{ x: geometrie.x, y: geometrie.y }];
  }

  if (geometrie.type === 'rectangle') {
    return [geometrie.a, geometrie.b];
  }

  const { centre, rayon } = geometrie;

  return [
    { x: borner(centre.x - rayon), y: borner(centre.y - rayon) },
    { x: borner(centre.x + rayon), y: borner(centre.y + rayon) },
  ];
}

/**
 * Le rectangle entre deux clics, rangé.
 *
 * `a` est toujours le coin haut gauche, quel que soit le sens du tracé —
 * l'API range pareil à l'écriture, et les deux doivent dire la même chose.
 */
export function rectangleEntre(
  depart: PointPlan,
  arrivee: PointPlan,
): Geometrie {
  return {
    type: 'rectangle',
    a: { x: Math.min(depart.x, arrivee.x), y: Math.min(depart.y, arrivee.y) },
    b: { x: Math.max(depart.x, arrivee.x), y: Math.max(depart.y, arrivee.y) },
  };
}

/** Le rond dont le premier clic est le centre et le second un point du bord. */
export function cercleEntre(centre: PointPlan, bord: PointPlan): Geometrie {
  const rayon = Math.hypot(bord.x - centre.x, bord.y - centre.y);

  return { type: 'cercle', centre, rayon };
}

/** Une forme a-t-elle assez de surface pour valoir un enregistrement ? */
export function aUneSurface(geometrie: Geometrie): boolean {
  if (geometrie.type === 'point') {
    return true;
  }

  if (geometrie.type === 'rectangle') {
    return geometrie.a.x !== geometrie.b.x && geometrie.a.y !== geometrie.b.y;
  }

  return geometrie.rayon > 0;
}

/** Rendu lisible d'une forme — ce qu'on écrit sous une carte, en toutes lettres. */
export function libelleDeLaForme(geometrie: Geometrie): string {
  if (geometrie.type === 'point') {
    return `${geometrie.x.toFixed(4)} · ${geometrie.y.toFixed(4)}`;
  }

  if (geometrie.type === 'rectangle') {
    const largeur = Math.abs(geometrie.b.x - geometrie.a.x);
    const hauteur = Math.abs(geometrie.b.y - geometrie.a.y);
    return `rectangle ${(largeur * 100).toFixed(1)} × ${(hauteur * 100).toFixed(1)}`;
  }

  return `rond de rayon ${(geometrie.rayon * 100).toFixed(1)}`;
}

function borner(valeur: number): number {
  return Math.min(1, Math.max(0, valeur));
}
