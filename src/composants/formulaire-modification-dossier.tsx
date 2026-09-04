'use client';

import { useState } from 'react';

import { usePermission } from '@/auth/use-permission';
import { ChampTexte } from './champ-texte';
import controles from './controles.module.css';
import { Modale } from './modale';

const VISIBILITES = ['public', 'restreint', 'prive'] as const;

type Niveau = (typeof VISIBILITES)[number];

const LIBELLES_VISIBILITE: Record<Niveau, string> = {
  public: 'Public',
  restreint: 'Restreint',
  prive: 'Privé',
};

export interface ValeursDossier {
  nom: string;
  note: string;
  visibilite: Niveau;
}

/**
 * Reprendre les informations d'un dossier.
 *
 * En modale, comme toute écriture : l'invariant 8 le demande, et la note se
 * corrigeait jusqu'ici en pleine page sans confirmation. Un seul endroit pour
 * les trois champs, plutôt qu'un formulaire par ligne.
 *
 * **Le classement d'un dossier se propage à tout ce qu'il porte** : la
 * visibilité effective d'un fait est la plus restrictive applicable, et le
 * dossier de saisie est l'un de ses gardiens. Le dire ici, où le geste se pose.
 */
export function FormulaireModificationDossier({
  valeursInitiales,
  enCours,
  erreur,
  onAnnuler,
  onEnregistrer,
}: {
  valeursInitiales: ValeursDossier;
  enCours: boolean;
  erreur: string | null;
  onAnnuler: () => void;
  onEnregistrer: (valeurs: ValeursDossier) => void;
}) {
  const peutClasser = usePermission('visibilite.definir');

  const [valeurs, definirValeurs] = useState(valeursInitiales);

  const regler = (partie: Partial<ValeursDossier>): void =>
    definirValeurs({ ...valeurs, ...partie });

  const classementChange = valeurs.visibilite !== valeursInitiales.visibilite;

  return (
    <Modale
      titre={`Modifier « ${valeursInitiales.nom} »`}
      libelleConfirmation="Enregistrer"
      enCours={enCours}
      confirmationBloquee={valeurs.nom.trim().length === 0}
      onAnnuler={onAnnuler}
      onConfirmer={() =>
        onEnregistrer({
          ...valeurs,
          nom: valeurs.nom.trim(),
          note: valeurs.note.trim(),
        })
      }
    >
      <ChampTexte
        etiquette="Nom"
        valeur={valeurs.nom}
        onChange={(nom) => regler({ nom })}
        indication="ce que l’enquête désigne, en clair"
      />

      <label className={controles.groupe}>
        <span className={controles.etiquette}>Note</span>
        <textarea
          className={controles.champ}
          rows={4}
          value={valeurs.note}
          onChange={(evenement) => regler({ note: evenement.target.value })}
          placeholder="Ce que l’enquête cherche."
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
        </label>
      )}

      {classementChange && (
        <p className={controles.remarque}>
          Le dossier est l’un des gardiens des faits qui y ont été saisis : les
          classer plus haut ferme aussi ce qu’ils portent, et une habilitation
          sur le dossier n’ouvre pas ses données pour autant.
        </p>
      )}

      {erreur && (
        <p className={controles.erreur} role="alert">
          {erreur}
        </p>
      )}
    </Modale>
  );
}
