'use client';

import { Fragment, useMemo, useState } from 'react';

import {
  useCataloguePermissions,
  useModifierRole,
  useRoles,
  type PermissionCataloguee,
  type Role,
} from '@/api/roles';
import { GardePermission } from '@/auth/garde-permission';
import controles from '@/composants/controles.module.css';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';
import propres from './matrice.module.css';

const FAMILLES: Record<string, string> = {
  entite: 'Données',
  fait: 'Faits',
  dossier: 'Dossiers',
  visibilite: 'Visibilité',
  acces: 'Accès dérogatoires',
  historique: 'Historique',
  journal: 'Journaux',
  graphe: 'Graphe',
  agent: 'Comptes',
  role: 'Grades',
};

export default function PageRoles() {
  return (
    <GardePermission
      permission="role.gerer"
      explication="La configuration des grades relève de la permission « role.gerer »."
    >
      <Matrice />
    </GardePermission>
  );
}

function Matrice() {
  const roles = useRoles();
  const catalogue = useCataloguePermissions();
  const modifier = useModifierRole();

  const [brouillon, definirBrouillon] = useState<Record<string, string[]>>({});
  const [aConfirmer, definirAConfirmer] = useState(false);
  const [echecs, definirEchecs] = useState<string[]>([]);

  const grades = useMemo(
    () => [...(roles.data ?? [])].sort((a, b) => a.ordre - b.ordre),
    [roles.data],
  );

  const parFamille = useMemo(() => {
    const groupes = new Map<string, PermissionCataloguee[]>();

    for (const permission of catalogue.data ?? []) {
      const prefixe = permission.code.split('.')[0];
      const famille = FAMILLES[prefixe] ?? prefixe;
      groupes.set(famille, [...(groupes.get(famille) ?? []), permission]);
    }

    return [...groupes.entries()];
  }, [catalogue.data]);

  const permissionsDe = (grade: Role): string[] =>
    brouillon[grade.id] ?? grade.permissions;

  const basculer = (grade: Role, code: string): void => {
    const courantes = permissionsDe(grade);
    const suivantes = courantes.includes(code)
      ? courantes.filter((permission) => permission !== code)
      : [...courantes, code];

    const identique =
      suivantes.length === grade.permissions.length &&
      suivantes.every((permission) => grade.permissions.includes(permission));

    definirBrouillon((precedent) => {
      const suivant = { ...precedent };

      if (identique) {
        delete suivant[grade.id];
      } else {
        suivant[grade.id] = suivantes;
      }

      return suivant;
    });
  };

  const touches = grades.filter((grade) => brouillon[grade.id] !== undefined);

  const enregistrer = async (): Promise<void> => {
    const rates: string[] = [];

    for (const grade of touches) {
      try {
        await modifier.mutateAsync({
          id: grade.id,
          permissions: brouillon[grade.id],
        });

        definirBrouillon((precedent) => {
          const suivant = { ...precedent };
          delete suivant[grade.id];
          return suivant;
        });
      } catch (erreur) {
        rates.push(`${grade.libelle} — ${(erreur as Error).message}`);
      }
    }

    definirEchecs(rates);
    definirAConfirmer(false);
  };

  return (
    <>
      <EnteteZone
        titre="Rôles et permissions"
        sousTitre="Une permission décrit un geste, jamais un objet : le droit de voir une donnée relève de sa visibilité et des habilitations, qui sont deux autres axes."
      />

      {catalogue.isError ? (
        <p className={controles.erreur}>{catalogue.error.message}</p>
      ) : (
        <div className={styles.panneau}>
          <div className={propres.defilement}>
            <table className={propres.matrice}>
              <thead>
                <tr>
                  <th className={`${propres.geste} ${propres.colonneGrade}`}>
                    Geste
                  </th>
                  {grades.map((grade) => (
                    <th
                      key={grade.id}
                      className={propres.colonneGrade}
                      data-modifie={brouillon[grade.id] !== undefined}
                    >
                      {grade.libelle}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {parFamille.map(([famille, permissions]) => (
                  <Fragment key={famille}>
                    <tr className={propres.famille}>
                      <td colSpan={grades.length + 1}>
                        <span className={propres.familleTitre}>{famille}</span>
                      </td>
                    </tr>

                    {permissions.map((permission) => (
                      <tr key={permission.code}>
                        <th scope="row" className={propres.geste}>
                          <span className={propres.libelleGeste}>
                            {permission.libelle}
                          </span>
                          <span className={propres.codeGeste}>
                            {permission.code}
                          </span>
                        </th>

                        {grades.map((grade) => (
                          <td key={grade.id} className={propres.cellule}>
                            <input
                              type="checkbox"
                              checked={permissionsDe(grade).includes(
                                permission.code,
                              )}
                              onChange={() => basculer(grade, permission.code)}
                              aria-label={`${permission.libelle} — ${grade.libelle}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <p className={controles.remarque}>
            Le super-admin n’est pas un grade mais un attribut du compte : la
            configuration du modèle métier — types de données, champs, types de
            liens — ne s’ouvre par aucune case de cette matrice, sous peine
            qu’un grade puisse s’accorder le droit de la modifier.
          </p>

          {echecs.length > 0 && (
            <div className={controles.erreur} role="alert">
              {echecs.map((echec) => (
                <p key={echec}>{echec}</p>
              ))}
            </div>
          )}

          {touches.length > 0 && (
            <div className={propres.barre}>
              <span className={propres.decompte}>
                {touches.length} grade{touches.length > 1 ? 's' : ''} modifié
                {touches.length > 1 ? 's' : ''} :{' '}
                {touches.map((grade) => grade.libelle).join(', ')}
              </span>

              <button
                type="button"
                className={controles.boutonDiscret}
                onClick={() => {
                  definirBrouillon({});
                  definirEchecs([]);
                }}
              >
                Abandonner
              </button>

              <button
                type="button"
                className={controles.bouton}
                onClick={() => definirAConfirmer(true)}
              >
                Enregistrer
              </button>
            </div>
          )}
        </div>
      )}

      {aConfirmer && (
        <Modale
          titre="Modifier ces grades ?"
          enCours={modifier.isPending}
          onAnnuler={() => definirAConfirmer(false)}
          onConfirmer={() => void enregistrer()}
        >
          <ul>
            {touches.map((grade) => (
              <li key={grade.id}>
                <strong>{grade.libelle}</strong> —{' '}
                {resumerEcart(grade, brouillon[grade.id])}
              </li>
            ))}
          </ul>
          <p className={controles.remarque}>
            Le changement s’applique immédiatement à tous les agents de ces
            grades, y compris à ceux dont la session est ouverte : l’API relit
            le compte à chaque requête.
          </p>
        </Modale>
      )}
    </>
  );
}

function resumerEcart(grade: Role, suivantes: string[]): string {
  const accordees = suivantes.filter(
    (permission) => !grade.permissions.includes(permission),
  );
  const retirees = grade.permissions.filter(
    (permission) => !suivantes.includes(permission),
  );

  const morceaux: string[] = [];

  if (accordees.length > 0) {
    morceaux.push(`+ ${accordees.join(', ')}`);
  }

  if (retirees.length > 0) {
    morceaux.push(`− ${retirees.join(', ')}`);
  }

  return morceaux.join(' · ');
}
