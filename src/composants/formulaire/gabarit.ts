import type { DefinitionChamp, TypeEntite } from '@/api/referentiel';

export function libellePrevu(
  type: TypeEntite,
  valeurs: Record<string, unknown>,
): string {
  return type.modeleLibelle
    .replace(/\{([a-z][a-z0-9_]*)\}/g, (_entier, cle: string) =>
      texteDe(valeurs[cle]),
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function texteDe(valeur: unknown): string {
  if (valeur === null || valeur === undefined) {
    return '';
  }

  if (Array.isArray(valeur)) {
    return valeur.map(texteDe).filter(Boolean).join(', ');
  }

  return String(valeur);
}

export function champsDuLibelle(type: TypeEntite): DefinitionChamp[] {
  const cles = [...type.modeleLibelle.matchAll(/\{([a-z][a-z0-9_]*)\}/g)].map(
    (trouve) => trouve[1],
  );

  return type.champs.filter((champ) => cles.includes(champ.cle));
}
