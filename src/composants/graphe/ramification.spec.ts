import { describe, expect, it } from 'vitest';

import type { AreteGraphe, NoeudGraphe } from '@/api/graphe';
import { adjacence, donneesVisibles, ramification } from './ramification';

const noeud = (id: string, libelle: string): NoeudGraphe => ({
  id,
  libelle,
  typeCode: 'personne',
  typeEntiteId: 't',
  visibilite: 'public',
  voisinsNonAffiches: 0,
  recurrence: false,
  x: null,
  y: null,
});

const arete = (id: string, de: string, vers: string): AreteGraphe => ({
  id,
  sujetId: de,
  cibleId: vers,
  typeLienId: 'tl',
  libelle: 'lien',
  fiabilite: 4,
});

/**
 * Un fil d'enquête, et une grappe qui n'a rien à voir avec lui :
 *
 *   isadora → sultan → braquage → tyron → madrina
 *   ana → buffalo              (à part)
 */
const NOEUDS = [
  noeud('isadora', 'Isadora Morales'),
  noeud('sultan', '8KLM204'),
  noeud('braquage', 'Braquage bijouterie'),
  noeud('tyron', 'Tyron Banks'),
  noeud('madrina', 'Madrina'),
  noeud('ana', 'Ana Silva'),
  noeud('buffalo', '4RTQ118'),
  noeud('isole', 'Dépôt Murrieta'),
];

const ARETES = [
  arete('a1', 'isadora', 'sultan'),
  arete('a2', 'sultan', 'braquage'),
  arete('a3', 'tyron', 'braquage'),
  arete('a4', 'tyron', 'madrina'),
  arete('a5', 'ana', 'buffalo'),
];

describe('adjacence', () => {
  it('relie dans les deux sens', () => {
    const voisins = adjacence(ARETES);

    // « Isadora possède 8KLM204 » se remonte aussi du véhicule vers elle.
    expect(voisins.get('isadora')).toContain('sultan');
    expect(voisins.get('sultan')).toContain('isadora');
  });
});

describe('ramification', () => {
  it('suit le fil jusqu’au bout, pas seulement les voisins directs', () => {
    const atteints = ramification(['isadora'], adjacence(ARETES));

    // Isadora ne touche que le Sultan ; le fil mène pourtant jusqu'à Madrina.
    expect([...atteints].sort()).toEqual(
      ['braquage', 'isadora', 'madrina', 'sultan', 'tyron'].sort(),
    );
  });

  it('n’attrape pas une grappe qui n’est pas reliée', () => {
    const atteints = ramification(['isadora'], adjacence(ARETES));

    expect(atteints.has('ana')).toBe(false);
    expect(atteints.has('buffalo')).toBe(false);
    expect(atteints.has('isole')).toBe(false);
  });

  it('ne tourne pas en rond sur un cycle', () => {
    const cycle = [
      arete('c1', 'a', 'b'),
      arete('c2', 'b', 'c'),
      arete('c3', 'c', 'a'),
    ];

    // Sans marquage à l'entrée, ce parcours ne terminerait pas.
    expect([...ramification(['a'], adjacence(cycle))].sort()).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('rend la donnée seule quand rien ne s’y rattache', () => {
    expect([...ramification(['isole'], adjacence(ARETES))]).toEqual(['isole']);
  });
});

describe('donneesVisibles', () => {
  it('ne filtre pas sous deux caractères', () => {
    expect(donneesVisibles('', NOEUDS, ARETES)).toBeNull();
    expect(donneesVisibles('8', NOEUDS, ARETES)).toBeNull();
  });

  it('montre la donnée trouvée et tout ce qui s’y rattache', () => {
    const visibles = donneesVisibles('8KLM', NOEUDS, ARETES)!;

    expect(visibles.has('sultan')).toBe(true);
    expect(visibles.has('madrina')).toBe(true);
    expect(visibles.has('ana')).toBe(false);
  });

  it('cherche sans égard à la casse et sur un fragment', () => {
    const visibles = donneesVisibles('morales', NOEUDS, ARETES)!;

    expect(visibles.has('isadora')).toBe(true);
  });

  it('part de toutes les données qui répondent, pas de la première', () => {
    const visibles = donneesVisibles('a', NOEUDS, ARETES);

    // « a » fait moins de deux caractères : aucun filtre.
    expect(visibles).toBeNull();

    const deux = donneesVisibles('an', NOEUDS, ARETES)!;

    // « Ana Silva » et « Banks » répondent tous deux : les deux grappes sortent.
    expect(deux.has('ana')).toBe(true);
    expect(deux.has('tyron')).toBe(true);
  });

  it('distingue « rien ne correspond » de « aucun filtre »', () => {
    const vide = donneesVisibles('zzzz', NOEUDS, ARETES);

    expect(vide).not.toBeNull();
    expect(vide!.size).toBe(0);
  });
});
