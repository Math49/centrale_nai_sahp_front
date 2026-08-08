'use client';

import controles from '../controles.module.css';
import styles from './formulaire.module.css';

export interface SourceActive {
  source: string;
  fiabilite: number;
  dateConstatation: string;
}

export const FIABILITES: { niveau: number; libelle: string; usage: string }[] =
  [
    {
      niveau: 4,
      libelle: 'Certain',
      usage: 'constatation directe, rapport signé',
    },
    {
      niveau: 3,
      libelle: 'Probable',
      usage: 'source identifiée mais indirecte',
    },
    { niveau: 2, libelle: 'À confirmer', usage: 'source unique non vérifiée' },
    { niveau: 1, libelle: 'Douteux', usage: 'rumeur, source anonyme' },
  ];

/**
 * Bandeau de source active.
 *
 * En tête de tout écran de saisie. Ses trois valeurs sont héritées par **tout
 * fait créé ensuite**, y compris ceux des entités créées en cascade : l'agent
 * ne corrige que les exceptions, et change le bandeau lorsqu'il passe à une
 * autre source.
 *
 * Le type de source est du texte totalement libre : il n'existe pas de liste
 * fermée, et il ne faut pas en inventer une.
 */
export function BandeauSource({
  valeur,
  onChange,
  fige = false,
}: {
  valeur: SourceActive;
  onChange: (valeur: SourceActive) => void;
  /** Dans un sous-formulaire : la source vient du formulaire parent. */
  fige?: boolean;
}) {
  return (
    <div className={styles.bandeau} role="group" aria-label="Source active">
      <span className={styles.bandeauTitre}>Source active</span>

      <label className={styles.bandeauChamp}>
        <span className={controles.etiquette}>Source</span>
        <input
          className={controles.champ}
          value={valeur.source}
          onChange={(evenement) =>
            onChange({ ...valeur, source: evenement.target.value })
          }
          placeholder="Rapport d’intervention n°2291"
          disabled={fige}
          required
        />
      </label>

      <label className={styles.bandeauChamp}>
        <span className={controles.etiquette}>Fiabilité</span>
        <select
          className={controles.champ}
          value={valeur.fiabilite}
          onChange={(evenement) =>
            onChange({ ...valeur, fiabilite: Number(evenement.target.value) })
          }
          disabled={fige}
        >
          {FIABILITES.map((niveau) => (
            <option key={niveau.niveau} value={niveau.niveau}>
              {niveau.libelle} — {niveau.usage}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.bandeauChamp}>
        <span className={controles.etiquette}>Constaté le</span>
        <input
          className={controles.champMono}
          type="date"
          value={valeur.dateConstatation}
          onChange={(evenement) =>
            onChange({ ...valeur, dateConstatation: evenement.target.value })
          }
          disabled={fige}
          required
        />
      </label>
    </div>
  );
}
