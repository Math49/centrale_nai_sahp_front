'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useRecherche, type ResultatRecherche } from '@/api/accueil';
import styles from './barre-recherche.module.css';
import { PastilleVisibilite } from './pastilles';

/**
 * Recherche globale, présente sur tout écran.
 *
 * Les objets inaccessibles n'y figurent pas, **sans mention ni décompte** :
 * c'est l'API qui en décide, jamais cet écran. Un total qui ne tomberait pas
 * juste serait déjà une information.
 *
 * Aucun « aucun résultat » sec non plus : la liste dit ce qu'elle a cherché.
 */
export function BarreRecherche() {
  const [saisie, definirSaisie] = useState('');
  const [ouverte, definirOuverte] = useState(false);
  const [surligne, definirSurligne] = useState(0);

  const router = useRouter();
  const conteneur = useRef<HTMLDivElement>(null);

  const resultats = useRecherche(saisie);
  const liste = resultats.data ?? [];

  // Un clic ailleurs referme la liste sans effacer la saisie : l'agent peut
  // reprendre sa recherche où il l'avait laissée.
  useEffect(() => {
    const auClic = (evenement: MouseEvent) => {
      if (!conteneur.current?.contains(evenement.target as Node)) {
        definirOuverte(false);
      }
    };

    document.addEventListener('mousedown', auClic);
    return () => document.removeEventListener('mousedown', auClic);
  }, []);

  const ouvrir = (resultat: ResultatRecherche) => {
    definirOuverte(false);
    definirSaisie('');

    // Ouvrir un dossier revient à ouvrir la fiche de sa donnée pivot : la
    // route de dossier s'en charge, on la laisse rediriger.
    router.push(
      resultat.nature === 'dossier'
        ? `/dossiers/${resultat.id}`
        : `/entites/${resultat.id}`,
    );
  };

  const auClavier = (evenement: React.KeyboardEvent<HTMLInputElement>) => {
    if (evenement.key === 'Escape') {
      definirOuverte(false);
      return;
    }

    if (liste.length === 0) {
      return;
    }

    if (evenement.key === 'ArrowDown') {
      evenement.preventDefault();
      definirSurligne((rang) => (rang + 1) % liste.length);
    } else if (evenement.key === 'ArrowUp') {
      evenement.preventDefault();
      definirSurligne((rang) => (rang - 1 + liste.length) % liste.length);
    } else if (evenement.key === 'Enter') {
      evenement.preventDefault();
      ouvrir(liste[surligne] ?? liste[0]);
    }
  };

  const deployee = ouverte && saisie.trim().length >= 2;

  return (
    <div className={styles.conteneur} ref={conteneur}>
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
          onChange={(evenement) => {
            definirSaisie(evenement.target.value);
            definirOuverte(true);
            definirSurligne(0);
          }}
          onFocus={() => definirOuverte(true)}
          onKeyDown={auClavier}
          placeholder="Rechercher une donnée, une plaque, un dossier"
          aria-label="Recherche globale"
          // Le motif ARIA de la liste déroulante veut `combobox` ; le rôle
          // natif de `type="search"` ne porte ni `aria-expanded` ni
          // `aria-controls`.
          role="combobox"
          aria-expanded={deployee}
          aria-controls="resultats-recherche"
        />
      </form>

      {deployee && (
        <ul
          className={styles.resultats}
          id="resultats-recherche"
          role="listbox"
          aria-label="Résultats"
        >
          {liste.length === 0 ? (
            <li className={styles.vide}>
              {resultats.isPending
                ? 'Recherche…'
                : 'Rien ne porte ce nom dans ce que vous pouvez consulter.'}
            </li>
          ) : (
            liste.map((resultat, rang) => (
              <li key={`${resultat.nature}:${resultat.id}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={rang === surligne}
                  className={styles.resultat}
                  data-surligne={rang === surligne || undefined}
                  onMouseEnter={() => definirSurligne(rang)}
                  onClick={() => ouvrir(resultat)}
                >
                  <span className={styles.libelle}>{resultat.libelle}</span>
                  <span className={styles.nature}>
                    {resultat.nature === 'dossier'
                      ? 'dossier'
                      : (resultat.typeCode ?? 'donnée')}
                  </span>
                  <PastilleVisibilite niveau={resultat.visibilite} />
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
