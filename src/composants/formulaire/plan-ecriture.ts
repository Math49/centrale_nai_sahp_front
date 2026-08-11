import type { CandidatOnglet, TypeEntite } from '@/api/referentiel';
import type { EntiteChoisie } from './champ-relationnel';

export interface PlanDEcriture {
  champs: { definitionChampId: string; valeur: string | number | boolean }[];

  directs: { typeLienId: string; cibleId: string }[];

  inverses: { typeLienId: string; sujetId: string }[];
}

export function cleRelation(typeLienId: string, sens: string): string {
  return `${typeLienId}:${sens}`;
}

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
