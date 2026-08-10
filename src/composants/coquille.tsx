'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useSession } from '@/auth/use-session';
import { BarreRecherche } from './barre-recherche';
import styles from './coquille.module.css';
import { Icone, type NomIcone } from './icones';
import { Logo } from './logo';
import { MenuAgent } from './menu-agent';

interface Zone {
  libelle: string;
  chemin: string;
  icone: NomIcone;
  /** Sans permission listée, la zone est visible de tous. */
  permissions?: string[];
}

const ZONES: Zone[] = [
  { libelle: 'Accueil', chemin: '/', icone: 'signal' },
  { libelle: 'Dossiers', chemin: '/dossiers', icone: 'dossier' },
  { libelle: 'Données', chemin: '/entites', icone: 'entite' },
  { libelle: 'Graphe', chemin: '/graphe', icone: 'graphe' },
  {
    libelle: 'Administration',
    chemin: '/admin',
    icone: 'reglages',
    // `entite.archiver` y figure pour la seule liste des orphelines : un Senior
    // qui entre dans la zone n'y voit que cette rubrique, chacune étant filtrée
    // par ses propres permissions.
    permissions: [
      'agent.gerer',
      'role.gerer',
      'journal.consulter',
      'entite.archiver',
    ],
  },
];

function estActive(chemin: string, courant: string): boolean {
  return chemin === '/' ? courant === '/' : courant.startsWith(chemin);
}

/**
 * Coquille de l'application — **barre latérale**, et non barre horizontale.
 *
 * La navigation est verticale parce que les zones sont peu nombreuses et
 * stables, tandis que la largeur est ce dont manquent les écrans denses de la
 * plateforme : un graphe, une fiche à onglets, un journal. Une barre latérale
 * étroite laisse la hauteur au contenu et garde la recherche globale en tête,
 * joignable de partout.
 */
// `children` garde son nom anglais : c'est une propriété de React, au même
// titre que `className`, et non un terme du domaine.
export function Coquille({ children }: { children: ReactNode }) {
  const { agent } = useSession();
  const courant = usePathname();

  // Une zone dont l'agent n'a aucune des permissions n'apparaît pas. Le back
  // refuse de toute façon ; masquer évite de proposer une porte fermée.
  const zones = ZONES.filter(
    (zone) =>
      !zone.permissions ||
      agent?.superAdmin ||
      zone.permissions.some((code) => agent?.permissions.includes(code)),
  );

  return (
    <div className={styles.application}>
      <aside className={styles.laterale}>
        <Link href="/" className={styles.marque}>
          <span className={styles.badge}>
            <Logo taille={30} />
          </span>
          <span className={styles.identite}>
            <span className={styles.nom}>
              Centrale <span className={styles.sigle}>N&amp;I</span>
            </span>
            <span className={styles.unite}>Narcotics &amp; Investigations</span>
          </span>
        </Link>

        <nav className={styles.navigation} aria-label="Zones">
          {zones.map((zone) => (
            <Link
              key={zone.chemin}
              href={zone.chemin}
              className={styles.zone}
              aria-current={
                estActive(zone.chemin, courant) ? 'page' : undefined
              }
            >
              <Icone nom={zone.icone} taille={17} />
              <span>{zone.libelle}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.pied}>
          <MenuAgent />
        </div>
      </aside>

      <div className={styles.colonne}>
        <header className={styles.entete}>
          <BarreRecherche />
        </header>

        <main className={styles.contenu}>{children}</main>
      </div>
    </div>
  );
}
