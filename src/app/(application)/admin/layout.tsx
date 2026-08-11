'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { useSession } from '@/auth/use-session';
import styles from './administration.module.css';

interface Rubrique {
  libelle: string;
  chemin: string;
  superAdminSeul?: boolean;
  permissions?: string[];
}

const RUBRIQUES: Rubrique[] = [
  { libelle: 'Vue d’ensemble', chemin: '/admin' },
  {
    libelle: 'Types de données',
    chemin: '/admin/types-entites',
    superAdminSeul: true,
  },
  {
    libelle: 'Types de liens',
    chemin: '/admin/types-liens',
    superAdminSeul: true,
  },
  {
    libelle: 'Mise en page des fiches',
    chemin: '/admin/fiches',
    superAdminSeul: true,
  },
  {
    libelle: 'Comptes agents',
    chemin: '/admin/agents',
    permissions: ['agent.gerer'],
  },
  {
    libelle: 'Rôles et permissions',
    chemin: '/admin/roles',
    permissions: ['role.gerer'],
  },
  {
    libelle: 'Journaux',
    chemin: '/admin/journal',
    permissions: ['journal.consulter'],
  },
  {
    libelle: 'Archives',
    chemin: '/admin/archives',
    permissions: ['journal.consulter'],
  },
  {
    libelle: 'Données orphelines',
    chemin: '/admin/orphelines',

    permissions: ['entite.archiver'],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const courant = usePathname();
  const { agent } = useSession();

  const rubriques = RUBRIQUES.filter((rubrique) => {
    if (agent?.superAdmin) {
      return true;
    }
    if (rubrique.superAdminSeul) {
      return false;
    }
    return (
      !rubrique.permissions ||
      rubrique.permissions.some((code) => agent?.permissions.includes(code))
    );
  });

  return (
    <div className={styles.cadre}>
      <nav className={styles.sousNavigation} aria-label="Administration">
        {rubriques.map((rubrique) => (
          <Link
            key={rubrique.chemin}
            href={rubrique.chemin}
            className={styles.rubriqueLien}
            aria-current={courant === rubrique.chemin ? 'page' : undefined}
          >
            {rubrique.libelle}
          </Link>
        ))}
      </nav>

      <div>{children}</div>
    </div>
  );
}
