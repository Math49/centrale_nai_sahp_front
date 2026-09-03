/**
 * Le fond de carte, et lui seul.
 *
 * Tout ce qui dépend du jeu de tuiles vit ici : le chemin, le découpage, les
 * niveaux de zoom, et la conversion entre le repère de la centrale et celui de
 * Leaflet. Changer de fond — passer au satellite, ajouter un niveau, recadrer —
 * se fait dans ce fichier et nulle part ailleurs.
 *
 * Origine, licence et raisons du choix : `public/images/carte/CREDITS.md`.
 */

export const FOND = {
  tuiles: '/images/carte/postal/{z}/{x}/{y}.webp',

  tailleTuile: 256,

  /** Côté de l'image source, en pixels. Le zoom natif la restitue au pixel près. */
  cote: 16384,

  zoomMin: 1,

  /**
   * Dernier niveau réellement transporté — 1 unité par pixel, d'après le
   * `tilemapresource.xml` du jeu de tuiles.
   */
  zoomNatif: 6,

  /**
   * Au-delà du natif, le navigateur agrandit lui-même.
   *
   * Le jeu d'origine allait jusqu'au zoom 7, mais ce niveau n'est qu'un
   * agrandissement 2× de la source : aucun détail de plus, 80 Mo et 16 000
   * fichiers en plus. `maxNativeZoom` donne le même résultat à l'écran sans
   * rien transporter.
   */
  zoomMax: 8,
} as const;

/**
 * Étendue du plan dans le repère de Leaflet, en unités de `CRS.Simple`.
 *
 * `CRS.Simple` place un pixel du zoom 0 sur une unité. Le plan faisant `cote`
 * pixels au zoom natif, il en occupe `cote / 2^zoomNatif` — ici 256.
 */
export const ETENDUE = FOND.cote / 2 ** FOND.zoomNatif;

/** Un point du plan, en coordonnées normalisées. */
export interface PointPlan {
  /** 0 au bord gauche, 1 au bord droit. */
  x: number;
  /** 0 en haut, 1 en bas. */
  y: number;
}

/**
 * Repère normalisé → repère de Leaflet, sous la forme `[lat, lng]`.
 *
 * **Toutes les coordonnées du projet restent normalisées** ; la conversion ne
 * vit qu'ici. C'est le piège de coordonnées du graphe, déjà payé une fois — on
 * ne le repaie pas. L'axe vertical s'inverse : `y` descend, la latitude monte.
 */
export function versToile({ x, y }: PointPlan): [number, number] {
  return [sansZeroNegatif(-y * ETENDUE), sansZeroNegatif(x * ETENDUE)];
}

/** Repère de Leaflet → repère normalisé. */
export function versPlan(lat: number, lng: number): PointPlan {
  return {
    x: sansZeroNegatif(lng / ETENDUE),
    y: sansZeroNegatif(-lat / ETENDUE),
  };
}

/**
 * L'inversion d'axe produit `-0` sur le bord haut, et `-0` finit toujours par
 * surprendre : il n'est égal à `0` que pour `===`, jamais pour `Object.is`, dont
 * dépendent les comparaisons de React. On le ramène ici plutôt que de le
 * rattraper à chaque usage — sans toucher à `NaN`, qui doit rester visible.
 */
function sansZeroNegatif(valeur: number): number {
  return valeur === 0 ? 0 : valeur;
}

/** Coins du plan, pour borner la caméra et cadrer à l'ouverture. */
export const BORNES: [[number, number], [number, number]] = [
  [-ETENDUE, 0],
  [0, ETENDUE],
];

/**
 * Le point tombe-t-il sur le plan ?
 *
 * Sert à refuser une saisie hors cadre plutôt qu'à la ramener au bord : un
 * point ramené silencieusement serait faux sans le dire.
 */
export function estSurLePlan(point: PointPlan): boolean {
  return (
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    point.x >= 0 &&
    point.x <= 1 &&
    point.y >= 0 &&
    point.y <= 1
  );
}

/** Rendu lisible d'un point — mêmes décimales partout, pour que ça s'aligne. */
export function libelleDuPoint(point: PointPlan): string {
  return `${point.x.toFixed(4)} · ${point.y.toFixed(4)}`;
}
