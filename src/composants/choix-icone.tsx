'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Icone, NOMS_ICONES, type NomIcone } from './icones';
import styles from './choix-icone.module.css';

function estNomIcone(valeur: string): valeur is NomIcone {
  return (NOMS_ICONES as readonly string[]).includes(valeur);
}

export function ChoixIcone({
  etiquette,
  valeur,
  onChange,
}: {
  etiquette: string;
  valeur: string;
  onChange: (valeur: string) => void;
}) {
  const identifiant = useId();
  const [ouvert, definirOuvert] = useState(false);
  const racine = useRef<HTMLDivElement | null>(null);
  const iconeValide = estNomIcone(valeur) ? valeur : null;

  useEffect(() => {
    const fermerSiClicExterieur = (evenement: MouseEvent): void => {
      if (
        racine.current &&
        evenement.target instanceof Node &&
        !racine.current.contains(evenement.target)
      ) {
        definirOuvert(false);
      }
    };

    const fermerAuClavier = (evenement: KeyboardEvent): void => {
      if (evenement.key === 'Escape') {
        definirOuvert(false);
      }
    };

    document.addEventListener('mousedown', fermerSiClicExterieur);
    document.addEventListener('keydown', fermerAuClavier);

    return () => {
      document.removeEventListener('mousedown', fermerSiClicExterieur);
      document.removeEventListener('keydown', fermerAuClavier);
    };
  }, []);

  return (
    <div
      ref={racine}
      className={styles.groupe}
      role="group"
      aria-labelledby={identifiant}
    >
      <span id={identifiant} className={styles.titre}>
        {etiquette}
      </span>

      <button
        type="button"
        className={styles.selectionCourante}
        aria-expanded={ouvert}
        onClick={() => definirOuvert((precedent) => !precedent)}
      >
        <span
          className={`${styles.selectionTexte} ${!iconeValide ? styles.selectionVide : ''}`}
        >
          <span className={styles.icone}>
            {iconeValide ? (
              <Icone nom={iconeValide} taille={18} />
            ) : (
              <Icone nom="image" taille={18} />
            )}
          </span>
          <span className={styles.selectionNom}>
            {iconeValide ? valeur : 'Aucune icône sélectionnée'}
          </span>
        </span>

        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {ouvert && (
        <div className={styles.popup}>
          <div className={styles.actionsPopup}>
            <span className={styles.aide}>Choisir une icône</span>

            {valeur && (
              <button
                type="button"
                className={styles.effacer}
                onClick={() => {
                  onChange('');
                  definirOuvert(false);
                }}
              >
                Effacer
              </button>
            )}
          </div>

          <div className={styles.grille}>
            {NOMS_ICONES.map((nom) => (
              <button
                key={nom}
                type="button"
                className={`${styles.option} ${valeur === nom ? styles.optionActive : ''}`}
                aria-pressed={valeur === nom}
                onClick={() => {
                  onChange(nom);
                  definirOuvert(false);
                }}
              >
                <span className={styles.icone}>
                  <Icone nom={nom} taille={18} />
                </span>
                <span className={styles.nom}>{nom}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
