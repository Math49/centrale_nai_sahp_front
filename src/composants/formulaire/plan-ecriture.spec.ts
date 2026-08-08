import { describe, expect, it } from 'vitest';

import {
  liensDisponiblesPour,
  type TypeEntite,
  type TypeLien,
} from '@/api/referentiel';
import { cleRelation, planDEcriture } from './plan-ecriture';

const champ = (id: string, cle: string) => ({
  id,
  typeEntiteId: 't-vehicule',
  cle,
  libelle: cle,
  typeDonnee: 'texte' as const,
  obligatoire: false,
  estUnique: false,
  multiple: false,
  options: null,
  ordre: 0,
});

const vehicule: TypeEntite = {
  id: 't-vehicule',
  code: 'vehicule',
  libelle: 'Véhicule',
  libellePluriel: 'Véhicules',
  icone: 'vehicule',
  modeleLibelle: '{plaque}',
  ordre: 0,
  champs: [champ('c-plaque', 'plaque'), champ('c-modele', 'modele')],
  onglets: [],
};

/** Personne → Véhicule : depuis la fiche du véhicule, il se lit à l'envers. */
const proprietaireDe: TypeLien = {
  id: 'l-proprietaire',
  code: 'proprietaire_de',
  libelle: 'propriétaire de',
  libelleInverse: 'appartient à',
  typeEntiteSourceId: 't-personne',
  typeEntiteCibleId: 't-vehicule',
  multiple: true,
  ordre: 0,
};

/** Véhicule → Groupe : depuis la fiche du véhicule, il se lit à l'endroit. */
const utilisePar: TypeLien = {
  id: 'l-utilise',
  code: 'utilise_par',
  libelle: 'utilisé par',
  libelleInverse: 'utilise',
  typeEntiteSourceId: 't-vehicule',
  typeEntiteCibleId: 't-groupe',
  multiple: true,
  ordre: 1,
};

const candidats = liensDisponiblesPour(vehicule, [proprietaireDe, utilisePar]);

describe('planDEcriture', () => {
  it('ne retient que les champs renseignés', () => {
    const plan = planDEcriture(
      vehicule,
      candidats,
      { plaque: '20DCC874', modele: null },
      {},
    );

    expect(plan.champs).toEqual([
      { definitionChampId: 'c-plaque', valeur: '20DCC874' },
    ]);
  });

  it('ignore un champ jamais touché', () => {
    const plan = planDEcriture(vehicule, candidats, {}, {});

    expect(plan.champs).toEqual([]);
  });

  it('emporte avec l’entité les liens dont elle est le sujet', () => {
    const plan = planDEcriture(
      vehicule,
      candidats,
      {},
      {
        [cleRelation('l-utilise', 'direct')]: [
          { id: 'e-madrina', libelle: 'Madrina' },
        ],
      },
    );

    expect(plan.directs).toEqual([
      { typeLienId: 'l-utilise', cibleId: 'e-madrina' },
    ]);
    expect(plan.inverses).toEqual([]);
  });

  it('diffère les liens dont elle est la cible — elle doit exister pour être désignée', () => {
    // C'est le cas du parcours Madrina : depuis la fiche du véhicule, on
    // désigne un propriétaire, mais le fait a la personne pour sujet.
    const plan = planDEcriture(
      vehicule,
      candidats,
      {},
      {
        [cleRelation('l-proprietaire', 'inverse')]: [
          { id: 'e-tyron', libelle: 'Tyron Banks' },
        ],
      },
    );

    expect(plan.directs).toEqual([]);
    expect(plan.inverses).toEqual([
      { typeLienId: 'l-proprietaire', sujetId: 'e-tyron' },
    ]);
  });

  it('sépare les deux sens dans une même saisie', () => {
    const plan = planDEcriture(
      vehicule,
      candidats,
      { plaque: '20DCC874' },
      {
        [cleRelation('l-proprietaire', 'inverse')]: [
          { id: 'e-tyron', libelle: 'Tyron Banks' },
        ],
        [cleRelation('l-utilise', 'direct')]: [
          { id: 'e-madrina', libelle: 'Madrina' },
        ],
      },
    );

    expect(plan.champs).toHaveLength(1);
    expect(plan.directs).toHaveLength(1);
    expect(plan.inverses).toHaveLength(1);
  });

  it('conserve plusieurs cibles sur un lien multiple', () => {
    const plan = planDEcriture(
      vehicule,
      candidats,
      {},
      {
        [cleRelation('l-proprietaire', 'inverse')]: [
          { id: 'e-tyron', libelle: 'Tyron Banks' },
          { id: 'e-isadora', libelle: 'Isadora Morales' },
        ],
      },
    );

    expect(plan.inverses.map((lien) => lien.sujetId)).toEqual([
      'e-tyron',
      'e-isadora',
    ]);
  });
});
