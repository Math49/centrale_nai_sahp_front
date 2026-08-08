import { describe, expect, it } from 'vitest';

import {
  liensDisponiblesPour,
  type TypeEntite,
  type TypeLien,
} from './referentiel';

const typeEntite = (id: string, libelle: string): TypeEntite => ({
  id,
  code: libelle.toLowerCase(),
  libelle,
  libellePluriel: `${libelle}s`,
  icone: 'x',
  modeleLibelle: '{nom}',
  ordre: 0,
  champs: [],
  onglets: [],
});

const typeLien = (
  id: string,
  libelle: string,
  libelleInverse: string,
  sourceId: string,
  cibleId: string,
): TypeLien => ({
  id,
  code: id,
  libelle,
  libelleInverse,
  typeEntiteSourceId: sourceId,
  typeEntiteCibleId: cibleId,
  multiple: true,
  ordre: 0,
});

const personne = typeEntite('t-personne', 'Personne');
const groupe = typeEntite('t-groupe', 'Groupe');
const evenement = typeEntite('t-evenement', 'Événement');

const membreDe = typeLien(
  'membre_de',
  'membre de',
  'a pour membre',
  personne.id,
  groupe.id,
);

const interpelleLorsDe = typeLien(
  'interpelle_lors_de',
  'interpellé lors de',
  'a interpellé',
  personne.id,
  evenement.id,
);

const allieDe = typeLien(
  'allie_de',
  'allié de',
  'allié de',
  groupe.id,
  groupe.id,
);

describe('liensDisponiblesPour', () => {
  it('propose le sens direct quand le type est la source', () => {
    const candidats = liensDisponiblesPour(personne, [membreDe]);

    expect(candidats).toEqual([
      { lien: membreDe, sens: 'direct', libelleLu: 'membre de' },
    ]);
  });

  it('propose le sens inverse quand le type est la cible', () => {
    // C'est le cas de l'onglet Membres du groupe : le lien va de la personne
    // vers le groupe, la fiche du groupe le lit donc à l'envers.
    const candidats = liensDisponiblesPour(groupe, [membreDe]);

    expect(candidats).toEqual([
      { lien: membreDe, sens: 'inverse', libelleLu: 'a pour membre' },
    ]);
  });

  it('écarte un lien qui ne touche pas le type', () => {
    expect(liensDisponiblesPour(evenement, [membreDe])).toEqual([]);
  });

  it('propose les deux sens quand les deux extrémités sont du même type', () => {
    const candidats = liensDisponiblesPour(groupe, [allieDe]);

    expect(candidats.map((candidat) => candidat.sens)).toEqual([
      'direct',
      'inverse',
    ]);
  });

  it('regroupe plusieurs liens fins sur le même type', () => {
    const presentLorsDe = typeLien(
      'present_lors_de',
      'présent lors de',
      'a vu présent',
      personne.id,
      evenement.id,
    );

    const candidats = liensDisponiblesPour(evenement, [
      interpelleLorsDe,
      presentLorsDe,
      membreDe,
    ]);

    expect(candidats).toHaveLength(2);
    expect(candidats.every((candidat) => candidat.sens === 'inverse')).toBe(
      true,
    );
    expect(candidats.map((candidat) => candidat.libelleLu)).toEqual([
      'a interpellé',
      'a vu présent',
    ]);
  });
});
