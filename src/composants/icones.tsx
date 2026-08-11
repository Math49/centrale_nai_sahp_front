import {
  faBoxArchive,
  faBuilding,
  faBullseye,
  faCalendarDays,
  faCar,
  faChevronRight,
  faCircleNodes,
  faClock,
  faFolder,
  faGear,
  faGripVertical,
  faImage,
  faLink,
  faLocationDot,
  faLock,
  faMagnifyingGlass,
  faPlus,
  faRightFromBracket,
  faSignal,
  faArrowDown,
  faArrowUp,
  faUser,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { SVGProps } from 'react';

const ICONES = {
  signal: faSignal,
  dossier: faFolder,
  entite: faBuilding,
  graphe: faCircleNodes,
  reglages: faGear,
  recherche: faMagnifyingGlass,
  personne: faUser,
  vehicule: faCar,
  lieu: faLocationDot,
  evenement: faCalendarDays,
  groupe: faUsers,
  horloge: faClock,
  plus: faPlus,
  fermer: faXmark,
  chevron: faChevronRight,
  sortie: faRightFromBracket,
  cible: faBullseye,
  lien: faLink,
  archive: faBoxArchive,
  image: faImage,
  poignee: faGripVertical,
  haut: faArrowUp,
  bas: faArrowDown,
  verrou: faLock,
} as const;

export type NomIcone = keyof typeof ICONES;
export const NOMS_ICONES = Object.keys(ICONES) as NomIcone[];

export function SvgIcone({
  definition,
  taille = 18,
  ...reste
}: {
  definition: IconDefinition;
  taille?: number;
} & SVGProps<SVGSVGElement>) {
  const [largeur, hauteur, , , chemins] = definition.icon;
  const listeChemins = Array.isArray(chemins) ? chemins : [chemins];

  return (
    <svg
      width={taille}
      height={taille}
      viewBox={`0 0 ${largeur} ${hauteur}`}
      fill="currentColor"
      aria-hidden="true"
      {...reste}
    >
      {listeChemins.map((chemin) => (
        <path key={chemin} d={chemin} />
      ))}
    </svg>
  );
}

export function Icone({
  nom,
  taille = 18,
  ...reste
}: { nom: NomIcone; taille?: number } & SVGProps<SVGSVGElement>) {
  return <SvgIcone definition={ICONES[nom]} taille={taille} {...reste} />;
}

/** Icône du type de donnée, avec un repli neutre pour un type inconnu. */
export function iconeDeType(code: string | null | undefined): NomIcone {
  switch (code) {
    case 'personne':
      return 'personne';
    case 'vehicule':
      return 'vehicule';
    case 'lieu':
      return 'lieu';
    case 'evenement':
      return 'evenement';
    case 'groupe':
      return 'groupe';
    default:
      return 'entite';
  }
}
