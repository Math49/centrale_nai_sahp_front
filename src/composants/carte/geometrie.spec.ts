import { describe, expect, it } from 'vitest';

import {
  aUneSurface,
  cercleEntre,
  libelleDeLaForme,
  lireGeometrie,
  pointsDeCadrage,
  rectangleEntre,
} from './geometrie';

describe('lecture d’une géométrie', () => {
  it('lit les trois formes', () => {
    expect(lireGeometrie({ type: 'point', x: 0.2, y: 0.3 })).toEqual({
      type: 'point',
      x: 0.2,
      y: 0.3,
    });

    expect(
      lireGeometrie({
        type: 'rectangle',
        a: { x: 0.1, y: 0.1 },
        b: { x: 0.4, y: 0.5 },
      }),
    ).toEqual({
      type: 'rectangle',
      a: { x: 0.1, y: 0.1 },
      b: { x: 0.4, y: 0.5 },
    });

    expect(
      lireGeometrie({ type: 'cercle', centre: { x: 0.5, y: 0.5 }, rayon: 0.1 }),
    ).toEqual({ type: 'cercle', centre: { x: 0.5, y: 0.5 }, rayon: 0.1 });
  });

  it.each([
    ['null', null],
    ['une chaîne', 'quelque part'],
    ['un tableau', []],
    ['un polygone, qui n’existe plus', { type: 'polygone', sommets: [] }],
    ['un rectangle amputé', { type: 'rectangle', a: { x: 0.1, y: 0.1 } }],
    [
      'un coin hors du plan',
      {
        type: 'rectangle',
        a: { x: 0.1, y: 0.1 },
        b: { x: 1.4, y: 0.5 },
      },
    ],
    ['un cercle sans rayon', { type: 'cercle', centre: { x: 0.5, y: 0.5 } }],
  ])('refuse %s', (_cas, valeur) => {
    expect(lireGeometrie(valeur)).toBeNull();
  });
});

describe('tracé en deux clics', () => {
  it('range le rectangle quel que soit le sens du tracé', () => {
    // Même contrat que l'API, qui range à l'écriture : les deux doivent dire
    // la même chose, sans quoi une zone tracée vers le haut se relirait
    // à l'envers.
    const attendu = {
      type: 'rectangle',
      a: { x: 0.2, y: 0.2 },
      b: { x: 0.5, y: 0.6 },
    };

    expect(rectangleEntre({ x: 0.5, y: 0.6 }, { x: 0.2, y: 0.2 })).toEqual(
      attendu,
    );
    expect(rectangleEntre({ x: 0.2, y: 0.2 }, { x: 0.5, y: 0.6 })).toEqual(
      attendu,
    );
  });

  it('prend le premier clic pour centre et le second pour bord', () => {
    expect(cercleEntre({ x: 0.5, y: 0.5 }, { x: 0.8, y: 0.5 })).toEqual({
      type: 'cercle',
      centre: { x: 0.5, y: 0.5 },
      rayon: 0.30000000000000004,
    });
  });

  it('refuse une forme sans surface', () => {
    expect(
      aUneSurface(rectangleEntre({ x: 0.3, y: 0.3 }, { x: 0.3, y: 0.7 })),
    ).toBe(false);
    expect(
      aUneSurface(cercleEntre({ x: 0.3, y: 0.3 }, { x: 0.3, y: 0.3 })),
    ).toBe(false);
    expect(aUneSurface({ type: 'point', x: 0.3, y: 0.3 })).toBe(true);
  });
});

describe('cadrage', () => {
  it('borne le cadre d’un rond au plan', () => {
    // Un rond posé près du bord déborde : le cadre se ramène sur le plan,
    // sinon Leaflet cadre sur du vide et l'agent ne voit plus rien.
    expect(
      pointsDeCadrage({
        type: 'cercle',
        centre: { x: 0.05, y: 0.05 },
        rayon: 0.2,
      }),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 0.25, y: 0.25 },
    ]);
  });
});

describe('libellé d’une forme', () => {
  it('écrit ce qu’on a tracé, en toutes lettres', () => {
    expect(libelleDeLaForme({ type: 'point', x: 0.5, y: 0.25 })).toBe(
      '0.5000 · 0.2500',
    );
    expect(
      libelleDeLaForme({
        type: 'rectangle',
        a: { x: 0.1, y: 0.1 },
        b: { x: 0.3, y: 0.5 },
      }),
    ).toBe('rectangle 20.0 × 40.0');
    expect(
      libelleDeLaForme({
        type: 'cercle',
        centre: { x: 0.5, y: 0.5 },
        rayon: 0.125,
      }),
    ).toBe('rond de rayon 12.5');
  });
});
