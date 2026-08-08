'use client';

import type { DefinitionChamp } from '@/api/referentiel';
import controles from '../controles.module.css';
import styles from './formulaire.module.css';

/**
 * Un champ, rendu depuis sa seule définition.
 *
 * Le formulaire n'existe pas à la compilation : il se construit à partir de
 * `definition_champ`, que le super-admin configure. Ajouter un type de donnée
 * se fait ici, et nulle part ailleurs.
 */
export function ChampDynamique({
  champ,
  valeur,
  onChange,
}: {
  champ: DefinitionChamp;
  valeur: unknown;
  onChange: (valeur: unknown) => void;
}) {
  const etiquette = (
    <span className={controles.etiquette}>
      {champ.libelle}
      {champ.obligatoire && <span className={styles.obligatoire}> ·</span>}
      {champ.estUnique && <span className={styles.marqueur}>unique</span>}
    </span>
  );

  if (champ.typeDonnee === 'booleen') {
    return (
      <label className={styles.bascule}>
        <input
          type="checkbox"
          checked={valeur === true}
          onChange={(evenement) => onChange(evenement.target.checked)}
        />
        {etiquette}
      </label>
    );
  }

  if (champ.typeDonnee === 'liste') {
    return (
      <label className={controles.groupe}>
        {etiquette}
        <select
          className={controles.champ}
          value={typeof valeur === 'string' ? valeur : ''}
          onChange={(evenement) =>
            onChange(
              evenement.target.value === '' ? null : evenement.target.value,
            )
          }
          required={champ.obligatoire}
        >
          <option value="">—</option>
          {(champ.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (champ.typeDonnee === 'fichier') {
    return (
      <label className={controles.groupe}>
        {etiquette}
        <span className={controles.remarque}>
          Le dépôt de fichiers arrive au lot 12.
        </span>
      </label>
    );
  }

  const type =
    champ.typeDonnee === 'nombre'
      ? 'number'
      : champ.typeDonnee === 'date'
        ? 'date'
        : champ.typeDonnee === 'datetime'
          ? 'datetime-local'
          : 'text';

  return (
    <label className={controles.groupe}>
      {etiquette}
      <input
        // Les identifiants se saisissent en monospace, comme ils s'affichent.
        className={champ.estUnique ? controles.champMono : controles.champ}
        type={type}
        value={valeurAffichable(valeur, champ)}
        onChange={(evenement) =>
          onChange(convertir(evenement.target.value, champ))
        }
        required={champ.obligatoire}
      />
    </label>
  );
}

function valeurAffichable(valeur: unknown, champ: DefinitionChamp): string {
  if (valeur === null || valeur === undefined) {
    return '';
  }

  if (champ.typeDonnee === 'datetime' && typeof valeur === 'string') {
    // L'API attend de l'ISO ; le contrôle natif veut « AAAA-MM-JJTHH:MM ».
    return valeur.slice(0, 16);
  }

  return String(valeur);
}

function convertir(saisie: string, champ: DefinitionChamp): unknown {
  if (saisie === '') {
    return null;
  }

  if (champ.typeDonnee === 'nombre') {
    const nombre = Number(saisie);
    return Number.isFinite(nombre) ? nombre : null;
  }

  if (champ.typeDonnee === 'datetime') {
    return new Date(saisie).toISOString();
  }

  return saisie;
}
