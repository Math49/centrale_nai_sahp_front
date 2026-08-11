'use client';

import { useState, type ReactNode } from 'react';

import { Icone } from './icones';
import styles from './liste-reordonnable.module.css';

export function ListeReordonnable<T extends { id: string }>({
  elements,
  rendu,
  onOrdonner,
  desactive = false,
}: {
  elements: T[];
  rendu: (element: T) => ReactNode;
  onOrdonner: (ids: string[]) => void;
  desactive?: boolean;
}) {
  const [saisi, definirSaisi] = useState<string | null>(null);
  const [survole, definirSurvole] = useState<string | null>(null);

  const deplacer = (depuis: number, vers: number): void => {
    if (depuis === vers || vers < 0 || vers >= elements.length) {
      return;
    }

    const ordre = elements.map((element) => element.id);
    const [deplace] = ordre.splice(depuis, 1);
    ordre.splice(vers, 0, deplace);
    onOrdonner(ordre);
  };

  return (
    <ul className={styles.liste}>
      {elements.map((element, rang) => (
        <li
          key={element.id}
          className={styles.element}
          data-saisi={saisi === element.id || undefined}
          data-cible={
            (survole === element.id && saisi !== element.id) || undefined
          }
          draggable={!desactive}
          onDragStart={() => definirSaisi(element.id)}
          onDragEnd={() => {
            definirSaisi(null);
            definirSurvole(null);
          }}
          onDragOver={(evenement) => {
            evenement.preventDefault();
            definirSurvole(element.id);
          }}
          onDrop={(evenement) => {
            evenement.preventDefault();
            const depuis = elements.findIndex(
              (candidat) => candidat.id === saisi,
            );
            if (depuis >= 0) {
              deplacer(depuis, rang);
            }
            definirSaisi(null);
            definirSurvole(null);
          }}
        >
          <span className={styles.poignee} aria-hidden="true">
            <Icone nom="poignee" taille={13} />
          </span>

          <div className={styles.corps}>{rendu(element)}</div>

          <div className={styles.deplacements}>
            <button
              type="button"
              className={styles.fleche}
              onClick={() => deplacer(rang, rang - 1)}
              disabled={desactive || rang === 0}
              aria-label="Monter"
            >
              <Icone nom="haut" taille={12} />
            </button>
            <button
              type="button"
              className={styles.fleche}
              onClick={() => deplacer(rang, rang + 1)}
              disabled={desactive || rang === elements.length - 1}
              aria-label="Descendre"
            >
              <Icone nom="bas" taille={12} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
