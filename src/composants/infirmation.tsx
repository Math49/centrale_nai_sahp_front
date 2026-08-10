'use client';

import { useState } from 'react';

import { useInfirmerFait } from '@/api/entites';
import controles from './controles.module.css';
import styles from './infirmation.module.css';
import { Modale } from './modale';

/**
 * Infirmation d'un fait.
 *
 * Le bouton ne dit **jamais** « supprimer » : rien n'est jamais supprimé. Un
 * fait contredit sort du graphe actif et reste consultable dans l'onglet
 * Historique, ce que la modale énonce avant que l'agent ne confirme.
 *
 * Le motif est obligatoire. Sans lui, la relecture du dossier se retrouverait
 * devant une information disparue sans explication — et c'est précisément la
 * situation que l'infirmation existe pour éviter.
 */
export function BoutonInfirmer({
  faitId,
  quoi,
}: {
  faitId: string;
  /** Ce qui sera infirmé, tel qu'il s'affiche à l'agent. */
  quoi: string;
}) {
  const [ouverte, definirOuverte] = useState(false);
  const [motif, definirMotif] = useState('');

  const infirmer = useInfirmerFait();

  const motifSuffisant = motif.trim().length >= 3;

  return (
    <>
      <button
        type="button"
        className={styles.declencheur}
        onClick={() => definirOuverte(true)}
        title="Infirmer ce fait"
      >
        infirmer
      </button>

      {ouverte && (
        <Modale
          titre={`Infirmer « ${quoi} » ?`}
          libelleConfirmation="Infirmer"
          enCours={infirmer.isPending}
          onAnnuler={() => {
            definirOuverte(false);
            definirMotif('');
          }}
          onConfirmer={() => {
            if (!motifSuffisant) {
              return;
            }

            infirmer.mutate(
              { id: faitId, motif },
              {
                onSuccess: () => {
                  definirOuverte(false);
                  definirMotif('');
                },
              },
            );
          }}
        >
          <p>
            Le fait sort du graphe actif et disparaît de la fiche. Il reste
            consultable dans l’onglet Historique : rien n’est jamais supprimé.
          </p>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>
              Ce qui le contredit — obligatoire
            </span>
            <input
              className={controles.champ}
              value={motif}
              onChange={(evenement) => definirMotif(evenement.target.value)}
              placeholder="Vidéosurveillance du 09/08 — ce n’était pas lui"
              autoFocus
            />
          </label>

          {!motifSuffisant && motif.length > 0 && (
            <p className={controles.remarque}>
              Un motif d’au moins trois caractères est attendu.
            </p>
          )}

          {infirmer.isError && (
            <p className={controles.erreur}>{infirmer.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}
