'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useDossiers } from '@/api/dossiers';
import { usePermission } from '@/auth/use-permission';
import { GardePermission } from '@/auth/garde-permission';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { PastilleVisibilite } from '@/composants/pastilles';
import { EnteteZone } from '@/composants/zone';
import styles from './dossiers.module.css';
import { FormulaireDossier } from './formulaire-dossier';

export default function PageDossiers() {
  return (
    <GardePermission
      permission="dossier.consulter"
      explication="Les dossiers ne s’ouvrent qu’aux grades qui portent le geste « dossier.consulter »."
    >
      <ListeDossiers />
    </GardePermission>
  );
}

function ListeDossiers() {
  const [archives, definirArchives] = useState(false);

  const dossiers = useDossiers(archives);
  const [creation, definirCreation] = useState(false);

  // Ouvrir un dossier est un geste de grade. Sans lui, l'API répond 403 : le
  // bouton ne serait qu'une promesse que la centrale ne tient pas.
  const peutCreer = usePermission('dossier.creer');

  return (
    <>
      <EnteteZone
        titre="Dossiers"
        sousTitre="Un dossier est un périmètre d’enquête ancré sur une donnée pivot. Il ne contient rien : il contextualise."
      />

      <div className={styles.barre}>
        {peutCreer && (
          <button
            type="button"
            className={controles.bouton}
            onClick={() => definirCreation((ouvert) => !ouvert)}
          >
            {creation ? 'Fermer' : 'Nouveau dossier'}
          </button>
        )}

        {/* Une enquête close n'a pas à alourdir la liste courante, mais elle
            reste entière : on la retrouve en la demandant. */}
        <label className={styles.bascule}>
          <input
            type="checkbox"
            checked={archives}
            onChange={(evenement) => definirArchives(evenement.target.checked)}
          />
          montrer les dossiers archivés
        </label>
      </div>

      {peutCreer && creation && (
        <FormulaireDossier onCree={() => definirCreation(false)} />
      )}

      {dossiers.isLoading && <p className={controles.remarque}>Chargement…</p>}

      {dossiers.isSuccess && dossiers.data.length === 0 ? (
        <EtatVide
          titre="Aucun dossier ouvert."
          explication="Un dossier s’ancre sur la donnée qui est au cœur de l’enquête — le groupe, le plus souvent."
          action={
            peutCreer ? (
              <button
                type="button"
                className={controles.bouton}
                onClick={() => definirCreation(true)}
              >
                Ouvrir un dossier
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className={styles.liste}>
          {(dossiers.data ?? []).map((dossier) => (
            <li key={dossier.id} className={styles.ligne}>
              <div className={styles.identite}>
                {}
                <Link className={styles.nom} href={`/dossiers/${dossier.id}`}>
                  {dossier.nom}
                </Link>
                <span className={styles.pivot}>
                  ancré sur {dossier.entitePivotLibelle}
                </span>
              </div>

              <span className={styles.suivis}>
                {dossier.nombreSuivis} donnée
                {dossier.nombreSuivis > 1 ? 's' : ''} suivie
                {dossier.nombreSuivis > 1 ? 's' : ''}
              </span>

              {dossier.etat === 'archive' && (
                <span className={styles.archive}>archivé</span>
              )}

              <PastilleVisibilite niveau={dossier.visibilite} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
