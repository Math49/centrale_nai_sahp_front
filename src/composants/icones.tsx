/**
 * Jeu d'icônes de l'interface.
 *
 * Dessinées ici plutôt qu'importées d'une bibliothèque : il en faut une
 * quinzaine, et une dépendance d'icônes pèserait plus que ce fichier. Toutes
 * partagent la même grille de 24, le même trait de 1,6 et `currentColor` —
 * elles héritent donc de la couleur du texte, ce qui les tient hors des trois
 * familles de couleur porteuses de sens.
 */
import type { SVGProps } from 'react';

const TRACES = {
  signal: 'M3 12h4l3 8 4-16 3 8h4',
  dossier:
    'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  entite: 'M4 20V9l8-5 8 5v11M4 20h16M9 20v-6h6v6',
  graphe:
    'M6 6.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M15 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M3 17.5a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0M10.2 8.3l5.6 7.4M8 9v6',
  reglages:
    'M10.3 4.3a1.7 1.7 0 0 1 3.4 0l.1.9 1.6.9.9-.3a1.7 1.7 0 0 1 1.7 2.9l-.7.6v1.8l.7.6a1.7 1.7 0 0 1-1.7 2.9l-.9-.3-1.6.9-.1.9a1.7 1.7 0 0 1-3.4 0l-.1-.9-1.6-.9-.9.3a1.7 1.7 0 0 1-1.7-2.9l.7-.6v-1.8l-.7-.6a1.7 1.7 0 0 1 1.7-2.9l.9.3 1.6-.9zM9.6 12a2.4 2.4 0 1 0 4.8 0 2.4 2.4 0 1 0-4.8 0',
  recherche: 'M4 11a7 7 0 1 0 14 0 7 7 0 1 0-14 0M16 16l4 4',
  personne: 'M8 8a4 4 0 1 0 8 0 4 4 0 1 0-8 0M4 20c0-3.3 3.6-5 8-5s8 1.7 8 5',
  vehicule:
    'M3 14h18M5 14l1.6-4.6A2 2 0 0 1 8.5 8h7a2 2 0 0 1 1.9 1.4L19 14M5 14v4h3v-2M19 14v4h-3v-2',
  lieu: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11M9.5 10a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0',
  evenement:
    'M12 3v3M12 21v-3M3 12h3M21 12h-3M5.6 5.6l2.1 2.1M18.4 18.4l-2.1-2.1M5.6 18.4l2.1-2.1M18.4 5.6l-2.1 2.1M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  groupe:
    'M7 9a3 3 0 1 0 6 0 3 3 0 1 0-6 0M2 19c0-2.6 2.7-4 6-4s6 1.4 6 4M16 8.2a3 3 0 0 1 0 5.6M18 19c0-2-1-3.2-2.6-3.8',
  horloge: 'M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0M12 7.5V12l3 2',
  plus: 'M12 5v14M5 12h14',
  fermer: 'M6 6l12 12M18 6L6 18',
  chevron: 'M9 6l6 6-6 6',
  sortie:
    'M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M10 12h11M18 9l3 3-3 3',
  cible:
    'M4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0M8.5 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 1 0-7 0M12 2v3M12 19v3M2 12h3M19 12h3',
  lien: 'M10 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.5-1.5',
  archive: 'M3 7h18v3H3zM5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9M9.5 14h5',
  image:
    'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8.5 9.5a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0M4 16l4.5-4 4 3.5L16 12l4 4',
} as const;

export type NomIcone = keyof typeof TRACES;
export const NOMS_ICONES = Object.keys(TRACES) as NomIcone[];

export function Icone({
  nom,
  taille = 18,
  ...reste
}: { nom: NomIcone; taille?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...reste}
    >
      <path d={TRACES[nom]} />
    </svg>
  );
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
