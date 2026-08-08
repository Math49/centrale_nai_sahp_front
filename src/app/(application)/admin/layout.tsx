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
    libelle: "Types d'entités",
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
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const courant = usePathname();
  const { agent } = useSession();

  const rubriques = RUBRIQUES.filter(
    (rubrique) => !rubrique.superAdminSeul || agent?.superAdmin,
  );

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
