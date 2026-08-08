import type { DefinitionChamp, TypeEntite } from '@/api/referentiel';

/**
 * Ce que le libellé de la fiche vaudra une fois enregistrée.
 *
 * Le calcul fait foi côté base, par trigger. Celui-ci n'en est qu'un écho, pour
 * deux usages : l'aperçu montré à l'agent, et la clé sur laquelle interroger la
 * détection de doublons — chercher « Tyron Banks » pendant la frappe suppose de
 * savoir que la fiche s'appellera ainsi.
 */
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

/** Les champs qui composent le libellé — ceux qu'on surveille pour le doublon. */
export function champsDuLibelle(type: TypeEntite): DefinitionChamp[] {
  const cles = [...type.modeleLibelle.matchAll(/\{([a-z][a-z0-9_]*)\}/g)].map(
    (trouve) => trouve[1],
  );

  return type.champs.filter((champ) => cles.includes(champ.cle));
}
