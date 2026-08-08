'use client';

import { useState } from 'react';

import styles from './barre-recherche.module.css';

/**
 * Recherche globale, élément transverse présent sur tout écran.
 *
 * La recherche elle-même arrive au lot 10, avec l'accueil : les objets privés
 * en seront absents, sans mention, et les résultats seront calculés après
 * application des règles de visibilité. Ici, seule la coquille existe.
 */
export function BarreRecherche() {
  const [saisie, definirSaisie] = useState('');

  return (
    <form
      className={styles.barre}
      role="search"
      onSubmit={(evenement) => evenement.preventDefault()}
    >
      <svg
        className={styles.loupe}
        width="14"
        height="14"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <circle
          cx="7"
          cy="7"
          r="5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <line
          x1="11"
          y1="11"
          x2="15"
          y2="15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>

      <input
        className={styles.champ}
        type="search"
        value={saisie}
        onChange={(evenement) => definirSaisie(evenement.target.value)}
        placeholder="Rechercher une entité, une plaque, un dossier"
        aria-label="Recherche globale"
      />
    </form>
  );
}
