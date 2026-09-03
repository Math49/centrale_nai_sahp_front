'use client';

import { useState } from 'react';

import type { TypeRepere } from '@/api/carte';
import { usePermission } from '@/auth/use-permission';
import { ChampTexte } from '@/composants/champ-texte';
import { libelleDeLaForme, type Geometrie } from '@/composants/carte/geometrie';
import controles from '@/composants/controles.module.css';
import { Modale } from '@/composants/modale';
import styles from './carte.module.css';

const VISIBILITES = ['public', 'restreint', 'prive'] as const;

export type Niveau = (typeof VISIBILITES)[number];

const LIBELLES_VISIBILITE: Record<Niveau, string> = {
  public: 'Public',
  restreint: 'Restreint',
  prive: 'Privé',
};

/** Palette d'ouverture, la même que celle des points de fiche. */
const PALETTE = [
  '#6f9dc4',
  '#d99a5b',
  '#c96f6f',
  '#6cc08a',
  '#b48ac4',
  '#d4c05a',
  '#8a8f98',
];

/** Ce qu'un repère porte et qui se règle à la main. */
export interface ValeursRepere {
  libelle: string;
  note: string;
  couleur: string;
  opacite: number;
  visibilite: Niveau;
}

/**
 * Ce qu'on demande avant d'inscrire un repère sur le plan — ou de le reprendre.
 *
 * **Un seul formulaire pour la pose et la correction.** Deux exemplaires
 * finiraient par diverger sur la palette ou sur ce que dit la visibilité, et
 * c'est précisément ce texte-là qu'il ne faut pas voir se dédoubler.
 *
 * Le libellé est obligatoire : un marqueur sans nom est une punaise, pas un
 * renseignement — et la carte du service se remplirait de points que personne
 * ne saurait relire.
 *
 * **La couleur se choisit ici**, et non sur le type : deux planques de même
 * sorte n'appellent pas le même signalement selon l'affaire.
 */
export function FormulaireRepere({
  titre,
  type,
  geometrie,
  valeursInitiales,
  libelleConfirmation = 'Enregistrer',
  enCours,
  erreur,
  onAnnuler,
  onEnregistrer,
}: {
  titre: string;
  type: TypeRepere;
  geometrie: Geometrie;
  valeursInitiales?: Partial<ValeursRepere>;
  libelleConfirmation?: string;
  enCours: boolean;
  erreur: string | null;
  onAnnuler: () => void;
  onEnregistrer: (valeurs: ValeursRepere) => void;
}) {
  const peutClasser = usePermission('visibilite.definir');

  const [valeurs, definirValeurs] = useState<ValeursRepere>(() => ({
    libelle: valeursInitiales?.libelle ?? '',
    note: valeursInitiales?.note ?? '',
    couleur: valeursInitiales?.couleur ?? PALETTE[0],
    opacite: valeursInitiales?.opacite ?? (type.nature === 'zone' ? 0.25 : 1),
    visibilite: valeursInitiales?.visibilite ?? 'public',
  }));

  const regler = (partie: Partial<ValeursRepere>): void =>
    definirValeurs({ ...valeurs, ...partie });

  return (
    <Modale
      titre={titre}
      libelleConfirmation={libelleConfirmation}
      enCours={enCours}
      confirmationBloquee={valeurs.libelle.trim().length === 0}
      onAnnuler={onAnnuler}
      onConfirmer={() =>
        onEnregistrer({
          ...valeurs,
          libelle: valeurs.libelle.trim(),
          note: valeurs.note.trim(),
        })
      }
    >
      <p className={controles.remarque}>
        {type.libelle} —{' '}
        {type.nature === 'point' ? 'un point en ' : 'une zone, '}
        <span className="mono">{libelleDeLaForme(geometrie)}</span>. Il restera
        consultable même après archivage.
      </p>

      <ChampTexte
        etiquette="Libellé"
        valeur={valeurs.libelle}
        onChange={(libelle) => regler({ libelle })}
        indication="ce que ce repère désigne, en clair"
      />

      <label className={controles.groupe}>
        <span className={controles.etiquette}>Note</span>
        <textarea
          className={controles.champ}
          rows={2}
          value={valeurs.note}
          onChange={(evenement) => regler({ note: evenement.target.value })}
          placeholder="Ce qu’on en sait, et d’où ça vient."
        />
      </label>

      <div className={controles.groupe}>
        <span className={controles.etiquette}>Couleur</span>

        <div className={styles.jetons}>
          {PALETTE.map((teinte) => (
            <button
              key={teinte}
              type="button"
              className={styles.teinte}
              style={{ background: teinte }}
              data-actif={valeurs.couleur.toLowerCase() === teinte}
              aria-label={`Couleur ${teinte}`}
              onClick={() => regler({ couleur: teinte })}
            />
          ))}

          <input
            type="color"
            className={styles.pipette}
            value={valeurs.couleur}
            aria-label="Couleur libre"
            onChange={(evenement) =>
              regler({ couleur: evenement.target.value })
            }
          />
        </div>
      </div>

      <label className={controles.groupe}>
        <span className={controles.etiquette}>
          Opacité — {Math.round(valeurs.opacite * 100)} %
        </span>
        <input
          type="range"
          min={0.05}
          max={1}
          step={0.05}
          value={valeurs.opacite}
          onChange={(evenement) =>
            regler({ opacite: Number(evenement.target.value) })
          }
        />
      </label>

      {peutClasser && (
        <label className={controles.groupe}>
          <span className={controles.etiquette}>Visibilité</span>
          <select
            className={controles.champ}
            value={valeurs.visibilite}
            onChange={(evenement) =>
              regler({ visibilite: evenement.target.value as Niveau })
            }
          >
            {VISIBILITES.map((niveau) => (
              <option key={niveau} value={niveau}>
                {LIBELLES_VISIBILITE[niveau]}
              </option>
            ))}
          </select>
          <span className={controles.remarque}>
            Classé, ce repère <strong>disparaît</strong> de la carte de qui n’y
            a pas droit — il n’y apparaît pas muet. Rouvrir demande une
            habilitation nominative.
          </span>
        </label>
      )}

      {erreur && (
        <p className={controles.erreur} role="alert">
          {erreur}
        </p>
      )}
    </Modale>
  );
}
