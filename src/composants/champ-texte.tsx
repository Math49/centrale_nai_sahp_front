'use client';

import controles from './controles.module.css';

/** Champ texte étiqueté, avec indication facultative sous le champ. */
export function ChampTexte({
  etiquette,
  valeur,
  onChange,
  indication,
  mono = false,
  obligatoire = true,
}: {
  etiquette: string;
  valeur: string;
  onChange: (valeur: string) => void;
  indication?: string;
  /** Les identifiants se saisissent en monospace, comme ils s'affichent. */
  mono?: boolean;
  obligatoire?: boolean;
}) {
  return (
    <label className={controles.groupe}>
      <span className={controles.etiquette}>{etiquette}</span>
      <input
        className={mono ? controles.champMono : controles.champ}
        value={valeur}
        onChange={(evenement) => onChange(evenement.target.value)}
        required={obligatoire}
      />
      {indication && <span className={controles.remarque}>{indication}</span>}
    </label>
  );
}
