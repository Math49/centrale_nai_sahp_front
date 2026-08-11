'use client';

import type { SuggestionDoublon } from '@/api/entites';
import styles from './formulaire.module.css';

export function AlerteDoublon({
  suggestions,
  onRetenir,
  libelleAction,
}: {
  suggestions: SuggestionDoublon[];
  onRetenir: (suggestion: SuggestionDoublon) => void;
  libelleAction: string;
}) {
  if (suggestions.length === 0) {
    return null;
  }

  const certain = suggestions.some(
    (suggestion) => suggestion.valeurUniqueIdentique,
  );

  return (
    <div className={certain ? styles.doublonCertain : styles.doublonPossible}>
      <p className={styles.doublonTitre}>
        {certain
          ? 'Une fiche porte déjà cette valeur unique.'
          : 'Des fiches proches existent déjà.'}
      </p>

      <ul className={styles.doublonListe}>
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <button
              type="button"
              className={styles.doublonChoix}
              onClick={() => onRetenir(suggestion)}
            >
              <span>{suggestion.libelle}</span>
              <span className={styles.doublonMotif}>
                {suggestion.valeurUniqueIdentique
                  ? 'valeur unique identique'
                  : `libellé proche · ${Math.round(suggestion.proximite * 100)} %`}
              </span>
              <span className={styles.doublonAction}>{libelleAction}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
