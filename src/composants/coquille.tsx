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

export function Coquille({ children }: { children: ReactNode }) {
  const { agent } = useSession();
  const courant = usePathname();

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
            <Logo taille={40} />
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
