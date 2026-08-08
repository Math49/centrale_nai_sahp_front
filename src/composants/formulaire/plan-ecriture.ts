import type { CandidatOnglet, TypeEntite } from '@/api/referentiel';
import type { EntiteChoisie } from './champ-relationnel';

export interface PlanDEcriture {
  /** Champs à passer avec la création de l'entité. */
  champs: { definitionChampId: string; valeur: string | number | boolean }[];

  /** Liens dont la nouvelle entité est le **sujet** : ils partent avec elle. */
  directs: { typeLienId: string; cibleId: string }[];

  /**
   * Liens dont la nouvelle entité est la **cible**. Ils ne peuvent être posés
   * qu'ensuite : une entité doit exister pour être désignée. Chacun devient un
   * fait dont le sujet est l'autre extrémité.
   */
  inverses: { typeLienId: string; sujetId: string }[];
}

export function cleRelation(typeLienId: string, sens: string): string {
  return `${typeLienId}:${sens}`;
}

/**
 * Traduit l'état du formulaire en suite d'écritures.
 *
 * C'est ici que se joue l'ordre imposé par la conception : l'entité créée en
 * cascade est persistée avant le lien qui la désigne, donc avant l'entité
 * parente. Une relation saisie en sens inverse ne peut donc pas voyager avec la
 * création — elle attend que la fiche existe.
 */
export function planDEcriture(
  type: TypeEntite,
  candidats: readonly CandidatOnglet[],
  valeurs: Record<string, unknown>,
  relations: Record<string, EntiteChoisie[]>,
): PlanDEcriture {
  const champs = type.champs
    .filter(
      (champ) =>
        valeurs[champ.cle] !== undefined && valeurs[champ.cle] !== null,
    )
    .map((champ) => ({
      definitionChampId: champ.id,
      // Le contrôle de forme appartient au serveur, qui construit son schéma
      // depuis `definition_champ` : le front transmet la saisie sans prétendre
      // la typer à sa place.
      valeur: valeurs[champ.cle] as string | number | boolean,
    }));

  const directs: PlanDEcriture['directs'] = [];
  const inverses: PlanDEcriture['inverses'] = [];

  for (const candidat of candidats) {
    const cle = cleRelation(candidat.lien.id, candidat.sens);

    for (const choisi of relations[cle] ?? []) {
      if (candidat.sens === 'direct') {
        directs.push({ typeLienId: candidat.lien.id, cibleId: choisi.id });
      } else {
        inverses.push({ typeLienId: candidat.lien.id, sujetId: choisi.id });
      }
    }
  }

  return { champs, directs, inverses };
}
