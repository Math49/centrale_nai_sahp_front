import { describe, expect, it } from 'vitest';

import { valeurRenseignee } from '../formulaire/champ-dynamique';
import { COULEUR_PAR_DEFAUT, lirePoint, lirePoints } from './choix-point';

/** Ce que porte un point sur lequel personne n'a rien choisi. */
const NU = { typeRepereId: null, couleur: COULEUR_PAR_DEFAUT };

describe('lecture d’un point', () => {
  it('reconnaît un point bien formé', () => {
    expect(lirePoint({ x: 0.25, y: 0.75 })).toEqual({
      x: 0.25,
      y: 0.75,
      ...NU,
    });
  });

  it('lit le type de repère et la couleur choisis à la pose', () => {
    expect(
      lirePoint({
        x: 0.25,
        y: 0.75,
        typeRepereId: 'type-1',
        couleur: '#6cc08a',
      }),
    ).toEqual({
      x: 0.25,
      y: 0.75,
      typeRepereId: 'type-1',
      couleur: '#6cc08a',
    });
  });

  it('ne retient rien d’autre que ce qu’un point porte', () => {
    expect(lirePoint({ x: 0.25, y: 0.75, note: 'ailleurs' })).toEqual({
      x: 0.25,
      y: 0.75,
      ...NU,
    });
  });

  it('retombe sur la couleur d’accent quand elle n’en est pas une', () => {
    // Le back range et valide ; le front ne fait pas confiance pour autant à
    // ce qui traverse le `jsonb` d'un fait écrit avant que ce champ existe.
    expect(lirePoint({ x: 0.2, y: 0.2, couleur: 42 })).toEqual({
      x: 0.2,
      y: 0.2,
      ...NU,
    });
  });

  it.each([
    ['null', null],
    ['indéfini', undefined],
    ['une chaîne', 'quelque part'],
    ['un nombre', 42],
    ['un tableau', [0.5, 0.5]],
    ['un point incomplet', { x: 0.5 }],
    ['des coordonnées textuelles', { x: '0.5', y: '0.5' }],
    ['un point hors du plan', { x: 1.5, y: 0.5 }],
    ['une coordonnée négative', { x: 0.5, y: -0.2 }],
  ])('refuse %s', (_cas, valeur) => {
    expect(lirePoint(valeur)).toBeNull();
  });

  it('lit une valeur multiple et écarte ce qui n’est pas un point', () => {
    expect(
      lirePoints([{ x: 0.1, y: 0.2 }, 'bruit', { x: 0.3, y: 0.4 }, { x: 9 }]),
    ).toEqual([
      { x: 0.1, y: 0.2, ...NU },
      { x: 0.3, y: 0.4, ...NU },
    ]);
  });

  it('lit une valeur simple comme une liste d’un seul point', () => {
    expect(lirePoints({ x: 0.6, y: 0.6 })).toEqual([{ x: 0.6, y: 0.6, ...NU }]);
    expect(lirePoints(null)).toEqual([]);
  });
});

describe('valeurRenseignee', () => {
  it('ferme la confirmation sur un point à moitié posé', () => {
    // Le garde d'origine testait null, undefined et la chaîne vide : `{ x }`
    // les traversait tous les trois et partait se faire refuser en 400.
    expect(valeurRenseignee({ x: 0.5 }, 'carte')).toBe(false);
    expect(valeurRenseignee({ x: 0.5, y: 0.5 }, 'carte')).toBe(true);
    expect(valeurRenseignee(null, 'carte')).toBe(false);
  });

  it('laisse les autres types se comporter comme avant', () => {
    expect(valeurRenseignee('Morales', 'texte')).toBe(true);
    expect(valeurRenseignee('', 'texte')).toBe(false);
    expect(valeurRenseignee(0, 'nombre')).toBe(true);
    expect(valeurRenseignee(false, 'booleen')).toBe(true);
    expect(valeurRenseignee(undefined, 'date')).toBe(false);
  });
});
