import { describe, expect, it } from 'vitest';

import {
  BORNES,
  ETENDUE,
  FOND,
  estSurLePlan,
  libelleDuPoint,
  versPlan,
  versToile,
} from './fond';

describe('fond de carte', () => {
  it('le zoom natif restitue la source au pixel près', () => {
    // C'est ce que dit le tilemapresource.xml du jeu de tuiles : au zoom 6,
    // une unité par pixel. Si ce calcul cesse d'être vrai, le fond a changé et
    // toutes les positions déjà posées sont à revérifier.
    expect(FOND.tailleTuile * 2 ** FOND.zoomNatif).toBe(FOND.cote);
  });

  it('ne transporte aucun niveau au-delà du natif', () => {
    // Le zoom 7 du jeu d'origine n'était qu'un agrandissement 2×. On le laisse
    // au navigateur : `zoomMax` va plus loin que `zoomNatif`, et c'est voulu.
    expect(FOND.zoomMax).toBeGreaterThan(FOND.zoomNatif);
  });

  it('place les quatre coins là où on les attend', () => {
    expect(versToile({ x: 0, y: 0 })).toEqual([0, 0]);
    expect(versToile({ x: 1, y: 0 })).toEqual([0, ETENDUE]);
    expect(versToile({ x: 0, y: 1 })).toEqual([-ETENDUE, 0]);
    expect(versToile({ x: 1, y: 1 })).toEqual([-ETENDUE, ETENDUE]);
  });

  it('descend quand y monte — l’axe vertical s’inverse', () => {
    const [hautLat] = versToile({ x: 0.5, y: 0.1 });
    const [basLat] = versToile({ x: 0.5, y: 0.9 });

    expect(hautLat).toBeGreaterThan(basLat);
  });

  it('fait l’aller-retour sans dériver', () => {
    for (const point of [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 0.5, y: 0.5 },
      { x: 0.123456, y: 0.987654 },
    ]) {
      const [lat, lng] = versToile(point);
      const retour = versPlan(lat, lng);

      expect(retour.x).toBeCloseTo(point.x, 12);
      expect(retour.y).toBeCloseTo(point.y, 12);
    }
  });

  it('borne le plan sur ses propres coins', () => {
    expect(BORNES).toEqual([
      versToile({ x: 0, y: 1 }),
      versToile({ x: 1, y: 0 }),
    ]);
  });

  it('refuse un point hors cadre plutôt que de le ramener au bord', () => {
    expect(estSurLePlan({ x: 0, y: 0 })).toBe(true);
    expect(estSurLePlan({ x: 1, y: 1 })).toBe(true);
    expect(estSurLePlan({ x: -0.001, y: 0.5 })).toBe(false);
    expect(estSurLePlan({ x: 0.5, y: 1.001 })).toBe(false);
    expect(estSurLePlan({ x: Number.NaN, y: 0.5 })).toBe(false);
    expect(estSurLePlan({ x: Number.POSITIVE_INFINITY, y: 0 })).toBe(false);
  });

  it('affiche les points avec le même nombre de décimales', () => {
    expect(libelleDuPoint({ x: 0.5, y: 0.25 })).toBe('0.5000 · 0.2500');
    expect(libelleDuPoint({ x: 0, y: 1 })).toBe('0.0000 · 1.0000');
  });
});
