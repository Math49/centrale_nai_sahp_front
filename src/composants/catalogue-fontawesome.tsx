import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import type {
  IconDefinition,
  IconPack,
  IconPrefix,
} from '@fortawesome/fontawesome-svg-core';

import { valeurIconeCanonique } from './icone-fontawesome';
import { SvgIcone } from './icones';

type PrefixeGratuit = Extract<IconPrefix, 'fas' | 'far' | 'fab'>;
type FamilleIcone = 'Solide' | 'Contour' | 'Marques';

export interface OptionIconeFontAwesome {
  valeur: string;
  libelle: string;
  famille: FamilleIcone;
  recherche: string;
  definition: IconDefinition;
}

const FAMILLES: {
  prefixe: PrefixeGratuit;
  famille: FamilleIcone;
  recherche: string;
  pack: IconPack;
}[] = [
  { prefixe: 'fas', famille: 'Solide', recherche: 'solid solide', pack: fas },
  {
    prefixe: 'far',
    famille: 'Contour',
    recherche: 'regular contour',
    pack: far,
  },
  {
    prefixe: 'fab',
    famille: 'Marques',
    recherche: 'brands marques',
    pack: fab,
  },
];

function cleIcone(definition: IconDefinition): string {
  return `${definition.prefix}:${definition.iconName}`;
}

function libelleNom(nom: string): string {
  return nom.replaceAll('-', ' ');
}

function creerCatalogue(): OptionIconeFontAwesome[] {
  const options = new Map<string, OptionIconeFontAwesome>();

  for (const { famille, pack, recherche } of FAMILLES) {
    for (const definition of Object.values(pack)) {
      const valeur = cleIcone(definition);

      if (options.has(valeur)) {
        continue;
      }

      const nom = definition.iconName;
      const aliases = definition.icon[2].join(' ');

      options.set(valeur, {
        valeur,
        famille,
        libelle: `${libelleNom(nom)} (${famille.toLowerCase()})`,
        recherche:
          `${nom} ${libelleNom(nom)} ${aliases} ${recherche}`.toLowerCase(),
        definition,
      });
    }
  }

  return [...options.values()].sort((a, b) => {
    const familleA = FAMILLES.findIndex(
      (famille) => famille.famille === a.famille,
    );
    const familleB = FAMILLES.findIndex(
      (famille) => famille.famille === b.famille,
    );

    return familleA === familleB
      ? a.libelle.localeCompare(b.libelle)
      : familleA - familleB;
  });
}

export const CATALOGUE_ICONES_FONTAWESOME = creerCatalogue();

const OPTIONS_PAR_VALEUR = new Map(
  CATALOGUE_ICONES_FONTAWESOME.map((option) => [option.valeur, option]),
);

export function optionIconeFontAwesome(
  valeur: string | null | undefined,
): OptionIconeFontAwesome | null {
  const canonique = valeurIconeCanonique(valeur);
  return canonique ? (OPTIONS_PAR_VALEUR.get(canonique) ?? null) : null;
}

export function IconeFontAwesome({
  valeur,
  taille = 18,
  className,
}: {
  valeur: string;
  taille?: number;
  className?: string;
}) {
  const option = optionIconeFontAwesome(valeur);

  if (!option) {
    return null;
  }

  return (
    <SvgIcone
      definition={option.definition}
      taille={taille}
      className={className}
    />
  );
}
