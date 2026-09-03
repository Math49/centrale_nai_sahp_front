'use client';

import { useState } from 'react';

import type { NatureRepere, TypeRepere } from '@/api/carte';
import controles from '@/composants/controles.module.css';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { Icone } from '@/composants/icones';
import styles from './carte.module.css';

export type Niveau = 'public' | 'restreint' | 'prive';

/**
 * Ce qu'on cherche sur le plan.
 *
 * Une liste vide veut dire **tout**, jamais **rien** : c'est la lecture
 * naturelle d'un filtre qu'on n'a pas touché, et elle évite d'avoir à cocher
 * sept cases pour voir la carte à l'ouverture.
 */
export interface Filtres {
  recherche: string;
  types: string[];
  natures: NatureRepere[];
  visibilites: Niveau[];
  reperes: boolean;
  donnees: boolean;
  archives: boolean;
}

export const FILTRES_INITIAUX: Filtres = {
  recherche: '',
  types: [],
  natures: [],
  visibilites: [],
  reperes: true,
  donnees: true,
  archives: false,
};

const LIBELLES_NATURE: Record<NatureRepere, string> = {
  point: 'Points',
  zone: 'Zones',
};

const LIBELLES_VISIBILITE: Record<Niveau, string> = {
  public: 'Public',
  restreint: 'Restreint',
  prive: 'Privé',
};

/** Un filtre est-il posé ? Sert au décompte et au bouton de remise à zéro. */
export function compterFiltresPoses(filtres: Filtres): number {
  return (
    (filtres.recherche.trim() === '' ? 0 : 1) +
    filtres.types.length +
    filtres.natures.length +
    filtres.visibilites.length +
    (filtres.reperes ? 0 : 1) +
    (filtres.donnees ? 0 : 1) +
    (filtres.archives ? 1 : 0)
  );
}

/**
 * La barre de filtres de la carte.
 *
 * Deux étages : ce qu'on manipule sans réfléchir — la recherche et les deux
 * couches — reste toujours visible ; le reste se déplie. Une carte de service
 * s'ouvre pour regarder, pas pour régler sept commandes.
 *
 * Les filtres ne s'appliquent qu'à **ce que l'agent voit déjà**. Ce qu'il n'a
 * pas le droit de voir n'est pas là du tout, et aucun compteur d'ici ne le
 * mentionne : sur une carte, la position est déjà le renseignement.
 */
export function BarreFiltres({
  types,
  filtres,
  onChange,
  reperesAffiches,
  donneesAffichees,
}: {
  types: TypeRepere[];
  filtres: Filtres;
  onChange: (filtres: Filtres) => void;
  reperesAffiches: number;
  donneesAffichees: number;
}) {
  const [deplie, definirDeplie] = useState(false);

  const poses = compterFiltresPoses(filtres);

  const basculer = <Cle extends 'types' | 'natures' | 'visibilites'>(
    cle: Cle,
    valeur: Filtres[Cle][number],
  ): void => {
    const courant = filtres[cle] as Filtres[Cle][number][];

    onChange({
      ...filtres,
      [cle]: courant.includes(valeur)
        ? courant.filter((element) => element !== valeur)
        : [...courant, valeur],
    });
  };

  return (
    <section className={styles.filtres} aria-label="Filtrer la carte">
      <div className={styles.ligneFiltres}>
        <label className={styles.recherche}>
          <Icone nom="recherche" taille={14} />
          <input
            className={styles.champRecherche}
            type="search"
            value={filtres.recherche}
            placeholder="Rechercher un repère, une note, une fiche…"
            onChange={(evenement) =>
              onChange({ ...filtres, recherche: evenement.target.value })
            }
          />
        </label>

        <div className={styles.jetons}>
          <button
            type="button"
            className={styles.jeton}
            data-actif={filtres.reperes}
            onClick={() => onChange({ ...filtres, reperes: !filtres.reperes })}
          >
            Repères du service
            <span className={styles.compte}>{reperesAffiches}</span>
          </button>

          <button
            type="button"
            className={styles.jeton}
            data-actif={filtres.donnees}
            onClick={() => onChange({ ...filtres, donnees: !filtres.donnees })}
          >
            Points des fiches
            <span className={styles.compte}>{donneesAffichees}</span>
          </button>
        </div>

        <button
          type="button"
          className={styles.deplier}
          aria-expanded={deplie}
          onClick={() => definirDeplie(!deplie)}
        >
          Filtres avancés
          {poses > 0 && <span className={styles.pastilleCompte}>{poses}</span>}
          <Icone nom={deplie ? 'haut' : 'bas'} taille={13} />
        </button>

        {poses > 0 && (
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => onChange(FILTRES_INITIAUX)}
          >
            Tout effacer
          </button>
        )}
      </div>

      {deplie && (
        <div className={styles.avances}>
          <div className={styles.groupeFiltre}>
            <span className={styles.titreFiltre}>Types</span>
            <div className={styles.jetons}>
              {types.length === 0 && (
                <span className={controles.remarque}>
                  Aucun type n’est défini — cela se règle en administration.
                </span>
              )}

              {types.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={styles.jeton}
                  data-actif={filtres.types.includes(type.id)}
                  onClick={() => basculer('types', type.id)}
                >
                  <IconeFontAwesome valeur={type.icone} taille={12} />
                  {type.libelle}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.groupeFiltre}>
            <span className={styles.titreFiltre}>Formes</span>
            <div className={styles.jetons}>
              {(['point', 'zone'] as NatureRepere[]).map((nature) => (
                <button
                  key={nature}
                  type="button"
                  className={styles.jeton}
                  data-actif={filtres.natures.includes(nature)}
                  onClick={() => basculer('natures', nature)}
                >
                  {LIBELLES_NATURE[nature]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.groupeFiltre}>
            <span className={styles.titreFiltre}>Visibilité</span>
            <div className={styles.jetons}>
              {(['public', 'restreint', 'prive'] as Niveau[]).map((niveau) => (
                <button
                  key={niveau}
                  type="button"
                  className={styles.jeton}
                  data-niveau={niveau}
                  data-actif={filtres.visibilites.includes(niveau)}
                  onClick={() => basculer('visibilites', niveau)}
                >
                  {LIBELLES_VISIBILITE[niveau]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.groupeFiltre}>
            <span className={styles.titreFiltre}>Archives</span>
            <label className={styles.bascule}>
              <input
                type="checkbox"
                checked={filtres.archives}
                onChange={(evenement) =>
                  onChange({ ...filtres, archives: evenement.target.checked })
                }
              />
              montrer les repères retirés de la carte
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
