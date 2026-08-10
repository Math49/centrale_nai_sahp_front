'use client';

import { useState } from 'react';

import { useEntites } from '@/api/entites';
import type { Chemin } from '@/api/graphe';
import controles from '@/composants/controles.module.css';
import { PastilleFiabilite } from '@/composants/pastilles';
import styles from './graphe.module.css';

/**
 * Restitution d'un chemin â€” mÃªme rendu sur l'accueil et sur le graphe.
 *
 * Extrait plutÃ´t que recopiÃ© : deux exemplaires finiraient par diverger, et
 * c'est ici que se lit l'invariant Â« un chemin vaut son maillon le plus
 * faible Â».
 *
 * L'absence de chemin est un rÃ©sultat comme un autre. La centrale ne dit jamais
 * qu'un chemin existe mais reste hors de portÃ©e : ce serait dÃ©jÃ  l'avoir dit.
 */
export function ResultatChemin({
  titre,
  chemin,
}: {
  titre: string;
  chemin: Chemin | null;
}) {
  return (
    <div className={styles.chemin}>
      <p className={styles.cheminTitre}>
        {titre}
        {chemin && (
          <span className={styles.cheminMesure}>
            {chemin.longueur} saut{chemin.longueur > 1 ? 's' : ''} Â· maillon le
            plus faible <PastilleFiabilite niveau={chemin.maillonLeFaible} />
          </span>
        )}
      </p>

      {chemin === null ? (
        <p className={controles.remarque}>
          Aucun chemin entre ces deux donnÃ©es.
        </p>
      ) : (
        <ol className={styles.trajet}>
          {chemin.noeuds.map((noeud, rang) => (
            <li key={noeud.id}>
              <span className={styles.etape}>{noeud.libelle}</span>
              {rang < chemin.aretes.length && (
                <div className={styles.fleche}>
                  â†“ {chemin.aretes[rang].libelle}{' '}
                  <PastilleFiabilite niveau={chemin.aretes[rang].fiabilite} />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/**
 * Les deux chemins, cÃ´te Ã  cÃ´te.
 *
 * Lorsqu'ils coÃ¯ncident, l'API renvoie `plusSolide` Ã  nul et un seul est
 * affichÃ© â€” la place laissÃ©e le dit plutÃ´t que de la laisser vide.
 */
export function DeuxChemins({
  plusCourt,
  plusSolide,
}: {
  plusCourt: Chemin | null;
  plusSolide: Chemin | null;
}) {
  return (
    <div className={styles.chemins}>
      <ResultatChemin titre="Le plus court" chemin={plusCourt} />

      {plusSolide ? (
        <ResultatChemin titre="Le plus solide" chemin={plusSolide} />
      ) : (
        plusCourt && (
          <div className={styles.chemin}>
            <p className={styles.cheminTitre}>Le plus solide</p>
            <p className={controles.remarque}>
              Identique au plus court â€” un seul est affichÃ©.
            </p>
          </div>
        )
      )}
    </div>
  );
}

/** SÃ©lecteur d'entitÃ© Ã  la frappe, commun aux deux extrÃ©mitÃ©s d'un chemin. */
export function ChoixEntite({
  etiquette,
  valeurId,
  onChoisir,
}: {
  etiquette: string;
  valeurId: string | null;
  onChoisir: (id: string | null) => void;
}) {
  const [recherche, definirRecherche] = useState('');
  const resultats = useEntites({ q: recherche });

  const choisie = (resultats.data ?? []).find(
    (entite) => entite.id === valeurId,
  );

  return (
    <div className={styles.champ}>
      <span className={controles.etiquette}>{etiquette}</span>

      <input
        className={controles.champ}
        value={recherche}
        onChange={(evenement) => definirRecherche(evenement.target.value)}
        placeholder={choisie?.libelle ?? 'Rechercher une entitÃ©'}
      />

      {recherche.trim().length > 0 && (
        <ul className={styles.suggestions}>
          {(resultats.data ?? []).slice(0, 8).map((entite) => (
            <li key={entite.id}>
              <button
                type="button"
                className={styles.suggestion}
                onClick={() => {
                  onChoisir(entite.id);
                  definirRecherche('');
                }}
              >
                {entite.libelle}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
