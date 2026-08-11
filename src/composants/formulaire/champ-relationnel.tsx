'use client';

import { useState } from 'react';

import { useEntites, type EntiteResumee } from '@/api/entites';
import { Icone } from '../icones';
import controles from '../controles.module.css';
import styles from './formulaire.module.css';

export interface EntiteChoisie {
  id: string;
  libelle: string;

  heritee?: boolean;
}

export function ChampRelationnel({
  libelle,
  typeCibleId,
  typeCibleLibelle,
  multiple,
  choisis,
  onAjouter,
  onRetirer,
  onCreer,
  raisonCreationFermee,
}: {
  libelle: string;
  typeCibleId: string;
  typeCibleLibelle: string;
  multiple: boolean;
  choisis: EntiteChoisie[];
  onAjouter: (entite: EntiteChoisie) => void;
  onRetirer: (id: string) => void;
  onCreer?: () => void;
  raisonCreationFermee?: string;
}) {
  const [recherche, definirRecherche] = useState('');
  const [ouvert, definirOuvert] = useState(false);

  const resultats = useEntites({ typeEntiteId: typeCibleId, q: recherche });

  const dejaChoisi = (id: string) =>
    choisis.some((element) => element.id === id);

  const complet = !multiple && choisis.length >= 1;

  return (
    <div className={styles.relation}>
      <span className={controles.etiquette}>
        {libelle}{' '}
        <span className={styles.relationType}>vers {typeCibleLibelle}</span>
      </span>

      {choisis.length > 0 && (
        <ul className={styles.puces}>
          {choisis.map((element) => (
            <li
              key={element.id}
              className={element.heritee ? styles.puceHeritee : styles.puce}
            >
              {element.heritee && (
                <span
                  aria-label="hérité du contexte"
                  title="Hérité du contexte"
                >
                  <Icone nom="verrou" taille={10} />
                </span>
              )}
              <span>{element.libelle}</span>
              <button
                type="button"
                className={styles.retirerPuce}
                onClick={() => onRetirer(element.id)}
                aria-label={`Retirer ${element.libelle}`}
              >
                <Icone nom="fermer" taille={10} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {!complet && (
        <div className={styles.rechercheRelation}>
          <input
            className={controles.champ}
            value={recherche}
            onChange={(evenement) => {
              definirRecherche(evenement.target.value);
              definirOuvert(true);
            }}
            onFocus={() => definirOuvert(true)}
            placeholder={`Rechercher ${typeCibleLibelle.toLowerCase()}…`}
            aria-label={`Rechercher ${libelle}`}
          />

          {onCreer ? (
            <button
              type="button"
              className={controles.boutonDiscret}
              onClick={onCreer}
            >
              Créer
            </button>
          ) : (
            raisonCreationFermee && (
              <span className={controles.remarque}>{raisonCreationFermee}</span>
            )
          )}

          {ouvert && recherche.trim().length > 0 && (
            <ul className={styles.suggestions}>
              {(resultats.data ?? [])
                .filter((entite: EntiteResumee) => !dejaChoisi(entite.id))
                .slice(0, 8)
                .map((entite: EntiteResumee) => (
                  <li key={entite.id}>
                    <button
                      type="button"
                      className={styles.suggestion}
                      onClick={() => {
                        onAjouter({ id: entite.id, libelle: entite.libelle });
                        definirRecherche('');
                        definirOuvert(false);
                      }}
                    >
                      {entite.libelle}
                    </button>
                  </li>
                ))}

              {resultats.isSuccess && (resultats.data ?? []).length === 0 && (
                <li className={styles.suggestionVide}>
                  Aucune fiche ne correspond.
                  {onCreer && ' Créer la fiche manquante depuis ce champ.'}
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
