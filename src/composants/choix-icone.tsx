'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import {
  CATALOGUE_ICONES_FONTAWESOME,
  IconeFontAwesome,
  optionIconeFontAwesome,
} from './catalogue-fontawesome';
import { valeurIconeCanonique } from './icone-fontawesome';
import { Icone } from './icones';
import styles from './choix-icone.module.css';

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
  const [filtre, definirFiltre] = useState('');
  const racine = useRef<HTMLDivElement | null>(null);
  const iconeCourante = optionIconeFontAwesome(valeur);
  const valeurCanonique = valeurIconeCanonique(valeur);
  const filtreNormalise = filtre.trim().toLowerCase();
  const options = useMemo(() => {
    if (!filtreNormalise) {
      return CATALOGUE_ICONES_FONTAWESOME;
    }

    const termes = filtreNormalise.split(/\s+/);
    return CATALOGUE_ICONES_FONTAWESOME.filter((option) =>
      termes.every((terme) => option.recherche.includes(terme)),
    );
  }, [filtreNormalise]);

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
          className={`${styles.selectionTexte} ${!iconeCourante ? styles.selectionVide : ''}`}
        >
          <span className={styles.icone}>
            {iconeCourante ? (
              <IconeFontAwesome valeur={iconeCourante.valeur} taille={18} />
            ) : (
              <Icone nom="image" taille={18} />
            )}
          </span>
          <span className={styles.selectionNom}>
            {iconeCourante
              ? iconeCourante.libelle
              : 'Aucune icône sélectionnée'}
          </span>
        </span>

        <span className={styles.chevron} aria-hidden="true">
          <Icone nom="chevron" taille={12} />
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

          <label className={styles.recherche}>
            <span className={styles.rechercheLibelle}>Rechercher</span>
            <input
              className={styles.champRecherche}
              value={filtre}
              onChange={(evenement) => definirFiltre(evenement.target.value)}
              placeholder="user, car, github..."
            />
          </label>

          <div className={styles.grille}>
            {options.map((option) => (
              <button
                key={option.valeur}
                type="button"
                className={`${styles.option} ${
                  valeurCanonique === option.valeur ? styles.optionActive : ''
                }`}
                aria-label={`Choisir ${option.libelle}`}
                aria-pressed={valeurCanonique === option.valeur}
                onClick={() => {
                  onChange(option.valeur);
                  definirOuvert(false);
                }}
              >
                <span className={styles.icone}>
                  <IconeFontAwesome valeur={option.valeur} taille={18} />
                </span>
                <span className={styles.nom}>{option.libelle}</span>
              </button>
            ))}
          </div>

          {options.length === 0 && (
            <p className={styles.aucunResultat}>Aucune icône trouvée.</p>
          )}
        </div>
      )}
    </div>
  );
}
