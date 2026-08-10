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
    // Écran de ménage : il suit la permission de qui peut agir sur un orphelin,
    // pas celle du relevé des consultations.
    permissions: ['entite.archiver'],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const courant = usePathname();
  const { agent } = useSession();

  // Masquer une rubrique fermée est du confort, pas de la sécurité : chaque
  // route de l'API refuse d'elle-même ce qu'elle doit refuser.
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
