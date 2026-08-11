'use client';

import { useState } from 'react';

import { useInfirmerFait } from '@/api/entites';
import controles from './controles.module.css';
import styles from './infirmation.module.css';
import { Modale } from './modale';

export function BoutonInfirmer({
  faitId,
  quoi,
}: {
  faitId: string;

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
