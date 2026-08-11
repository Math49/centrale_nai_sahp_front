import type { CSSProperties, HTMLAttributes } from 'react';

type PrefixeGratuit = 'fas' | 'far' | 'fab';

const CLASSES_PREFIXE: Record<PrefixeGratuit, string> = {
  fas: 'fa-solid',
  far: 'fa-regular',
  fab: 'fa-brands',
};

const ALIASES_HISTORIQUES: Record<string, string> = {
  signal: 'fas:signal',
  dossier: 'fas:folder',
  entite: 'fas:building',
  graphe: 'fas:circle-nodes',
  reglages: 'fas:gear',
  recherche: 'fas:magnifying-glass',
  personne: 'fas:user',
  vehicule: 'fas:car',
  lieu: 'fas:location-dot',
  evenement: 'fas:calendar-days',
  groupe: 'fas:users',
  horloge: 'fas:clock',
  plus: 'fas:plus',
  fermer: 'fas:xmark',
  chevron: 'fas:chevron-right',
  sortie: 'fas:right-from-bracket',
  cible: 'fas:bullseye',
  lien: 'fas:link',
  archive: 'fas:box-archive',
  image: 'fas:image',
};

function prefixeDepuisClasse(classe: string): PrefixeGratuit | null {
  switch (classe) {
    case 'fa-solid':
    case 'fas':
      return 'fas';
    case 'fa-regular':
    case 'far':
      return 'far';
    case 'fa-brands':
    case 'fab':
      return 'fab';
    default:
      return null;
  }
}

export function valeurIconeCanonique(
  valeur: string | null | undefined,
): string | null {
  const propre = valeur?.trim();

  if (!propre) {
    return null;
  }

  const alias = ALIASES_HISTORIQUES[propre];

  if (alias) {
    return alias;
  }

  const avecPrefixe = propre.match(/^(fas|far|fab):(.+)$/);

  if (avecPrefixe) {
    return `${avecPrefixe[1]}:${avecPrefixe[2]}`;
  }

  const classes = propre.split(/\s+/);
  const prefixe = classes.find(prefixeDepuisClasse);
  const classeIcone = classes.find(
    (classe) => classe.startsWith('fa-') && !prefixeDepuisClasse(classe),
  );

  if (prefixe && classeIcone) {
    return `${prefixeDepuisClasse(prefixe)}:${classeIcone.replace(/^fa-/, '')}`;
  }

  return `fas:${propre}`;
}

export function IconeFontAwesome({
  valeur,
  taille = 18,
  className,
  style,
  ...reste
}: {
  valeur: string | null | undefined;
  taille?: number;
} & HTMLAttributes<HTMLElement>) {
  const canonique = valeurIconeCanonique(valeur);

  if (!canonique) {
    return null;
  }

  const [prefixe, nom] = canonique.split(':') as [PrefixeGratuit, string];
  const styleIcone: CSSProperties = { fontSize: taille, ...style };

  return (
    <i
      className={`${CLASSES_PREFIXE[prefixe]} fa-${nom} ${className ?? ''}`.trim()}
      aria-hidden="true"
      style={styleIcone}
      {...reste}
    />
  );
}
