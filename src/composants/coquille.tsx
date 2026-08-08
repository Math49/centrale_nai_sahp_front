'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useSession } from '@/auth/use-session';
import { BarreRecherche } from './barre-recherche';
import styles from './coquille.module.css';
import { Logo } from './logo';
import { MenuAgent } from './menu-agent';

interface Zone {
  libelle: string;
  chemin: string;
  /** Sans permission listée, la zone est visible de tous. */
  permissions?: string[];
}

const ZONES: Zone[] = [
  { libelle: 'Accueil', chemin: '/' },
  { libelle: 'Dossiers', chemin: '/dossiers' },
  { libelle: 'Entités', chemin: '/entites' },
  { libelle: 'Graphe', chemin: '/graphe' },
  {
    libelle: 'Administration',
    chemin: '/admin',
    permissions: ['agent.gerer', 'role.gerer', 'journal.consulter'],
  },
];

function estActive(chemin: string, courant: string): boolean {
  return chemin === '/' ? courant === '/' : courant.startsWith(chemin);
}

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
      <header className={styles.entete}>
        <Link href="/" className={styles.marque}>
          <Logo />
          <span className={styles.nom}>
            Centrale <span className={styles.sigle}>N&amp;I</span>
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
              {zone.libelle}
            </Link>
          ))}
        </nav>

        <BarreRecherche />
        <MenuAgent />
      </header>

      <main className={styles.contenu}>{children}</main>
    </div>
  );
}
