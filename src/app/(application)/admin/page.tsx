'use client';

import Link from 'next/link';

import { useSession } from '@/auth/use-session';
import { EnteteZone } from '@/composants/zone';
import styles from './admin.module.css';

interface Rubrique {
  libelle: string;
  description: string;
  lot: string;

  permissions: string[];
  superAdminSeul?: boolean;

  chemin?: string;
}

const RUBRIQUES: Rubrique[] = [
  {
    libelle: 'Types de données et champs',
    description: 'Nom, icône, champs typés, obligatoires ou uniques.',
    lot: 'Lot 3',
    permissions: [],
    superAdminSeul: true,
    chemin: '/admin/types-entites',
  },
  {
    libelle: 'Types de liens',
    description: 'Libellé, libellé inverse, contraintes de domaine.',
    lot: 'Lot 3',
    permissions: [],
    superAdminSeul: true,
    chemin: '/admin/types-liens',
  },
  {
    libelle: 'Mise en page des fiches',
    description:
      'Quels onglets, quels types de liens dans chacun, dans quel ordre.',
    lot: 'Lot 3',
    permissions: [],
    superAdminSeul: true,
    chemin: '/admin/fiches',
  },
  {
    libelle: 'Rôles et permissions',
    description:
      'Jeu de permissions de chaque grade, entièrement configurable.',
    lot: 'Lot 1',
    permissions: ['role.gerer'],
    chemin: '/admin/roles',
  },
  {
    libelle: 'Comptes agents',
    description:
      "Création, modification, anonymisation. Pas d'inscription libre.",
    lot: 'Lot 1',
    permissions: ['agent.gerer'],
    chemin: '/admin/agents',
  },
  {
    libelle: 'Journaux',
    description:
      'Toute lecture de fiche est tracée, y compris celles du super-admin, qui y sont signalées. Toute écriture aussi.',
    lot: 'Lot 11',
    permissions: ['journal.consulter'],
    chemin: '/admin/journal',
  },
  {
    libelle: 'Archives',
    description:
      'Rien n’est supprimé : tout est archivé, infirmé ou anonymisé.',
    lot: 'Lot 11',
    permissions: ['journal.consulter'],
    chemin: '/admin/archives',
  },
  {
    libelle: 'Données orphelines',
    description:
      'Données restées sans lien après une saisie interrompue. Liste discrète, sans signal.',
    lot: 'Lot 11',
    permissions: ['entite.archiver'],
    chemin: '/admin/orphelines',
  },
];

export default function PageAdmin() {
  const { agent } = useSession();

  const accessible = (rubrique: Rubrique): boolean => {
    if (agent?.superAdmin) {
      return true;
    }
    if (rubrique.superAdminSeul) {
      return false;
    }
    return rubrique.permissions.some((code) =>
      agent?.permissions.includes(code),
    );
  };

  const rubriques = RUBRIQUES.filter(accessible);

  return (
    <>
      <EnteteZone
        titre="Administration"
        sousTitre="Seules apparaissent les rubriques que votre grade autorise."
      />

      <ul className={styles.liste}>
        {rubriques.map((rubrique) => {
          const entete = (
            <>
              <div>
                <p className={styles.libelle}>{rubrique.libelle}</p>
                <p className={styles.description}>{rubrique.description}</p>
              </div>
              <span className={styles.lot}>
                {rubrique.chemin ? 'ouvrir →' : rubrique.lot}
              </span>
            </>
          );

          return (
            <li key={rubrique.libelle} className={styles.rubrique}>
              {rubrique.chemin ? (
                <Link href={rubrique.chemin} className={styles.ouvrable}>
                  {entete}
                </Link>
              ) : (
                entete
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
