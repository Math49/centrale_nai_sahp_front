'use client';

import type { DefinitionChamp } from '@/api/referentiel';
import { ChoixPoint } from '../carte/choix-point';
import { libelleDuPoint } from '../carte/fond';
import { lirePoint } from '../carte/choix-point';
import controles from '../controles.module.css';
import styles from './formulaire.module.css';

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

  if (champ.typeDonnee === 'carte') {
    /*
     * Un `<div>`, surtout pas un `<label>`.
     *
     * Un `<label>` renvoie vers la commande qu'il étiquette **tout** clic qu'il
     * reçoit. La carte vit à l'intérieur : le clic destiné au plan repartait
     * vers le bouton « Retirer le point » — apparu au rendu précédent — qui
     * effaçait aussitôt le point qu'on venait de poser. Rien dans la console,
     * aucune erreur : le point clignotait et disparaissait, et poser un point
     * depuis une fiche était simplement impossible.
     */
    return (
      <div className={controles.groupe}>
        {etiquette}
        <ChoixPoint valeur={valeur} onChange={onChange} />
      </div>
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
    return valeur.slice(0, 16);
  }

  // Un point ne passe jamais par un `input`, mais la fonction est le seul
  // endroit qui convertit une valeur en texte : la laisser tomber sur
  // `String(valeur)` produirait « [object Object] » au premier oubli.
  if (champ.typeDonnee === 'carte') {
    const point = lirePoint(valeur);
    return point ? libelleDuPoint(point) : '';
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

/**
 * La valeur est-elle réellement renseignée, pour ce type de champ ?
 *
 * Tester `null`, `undefined` et la chaîne vide suffisait tant que toute valeur
 * était un scalaire. Un point à moitié posé — `{ x: 0.3 }` — passerait ces
 * trois épreuves et partirait à l'API, qui le refuserait en 400 : un aller-
 * retour et un message d'erreur, là où le bouton pouvait rester fermé.
 */
export function valeurRenseignee(
  valeur: unknown,
  typeDonnee: DefinitionChamp['typeDonnee'],
): boolean {
  if (valeur === null || valeur === undefined || valeur === '') {
    return false;
  }

  if (typeDonnee === 'carte') {
    return lirePoint(valeur) !== null;
  }

  return true;
}
