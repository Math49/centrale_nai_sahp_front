import { describe, expect, it } from 'vitest';

import type { TypeEntite } from '@/api/referentiel';
import { champsDuLibelle, libellePrevu } from './gabarit';

const champ = (cle: string) => ({
  id: `c-${cle}`,
  typeEntiteId: 't-personne',
  cle,
  libelle: cle,
  typeDonnee: 'texte' as const,
  obligatoire: false,
  estUnique: false,
  multiple: false,
  options: null,
  ordre: 0,
});

const personne: TypeEntite = {
  id: 't-personne',
  code: 'personne',
  libelle: 'Personne',
  libellePluriel: 'Personnes',
  icone: 'personne',
  modeleLibelle: '{prenom} {nom}',
  ordre: 0,
  champs: [champ('prenom'), champ('nom'), champ('date_de_naissance')],
  onglets: [],
};

describe('libellePrevu', () => {
  it('compose le libellé depuis le gabarit', () => {
    expect(libellePrevu(personne, { prenom: 'Tyron', nom: 'Banks' })).toBe(
      'Tyron Banks',
    );
  });

  it('resserre les espaces d’un champ encore vide', () => {
    // Pendant la frappe, la moitié du gabarit manque : « Tyron » vaut mieux
    // que « Tyron  », ne serait-ce que pour la recherche de doublons.
    expect(libellePrevu(personne, { prenom: 'Tyron' })).toBe('Tyron');
  });

  it('rend une chaîne vide quand rien n’est saisi', () => {
    expect(libellePrevu(personne, {})).toBe('');
  });

  it('joint les valeurs d’un champ multiple', () => {
    expect(
      libellePrevu(personne, { prenom: ['Tyron', 'Ty'], nom: 'Banks' }),
    ).toBe('Tyron, Ty Banks');
  });
});

describe('champsDuLibelle', () => {
  it('ne retient que les champs que le gabarit cite', () => {
    expect(champsDuLibelle(personne).map((champ) => champ.cle)).toEqual([
      'prenom',
      'nom',
    ]);
  });
});
