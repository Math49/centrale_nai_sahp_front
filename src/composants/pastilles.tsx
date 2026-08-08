import styles from './pastilles.module.css';

export const NIVEAUX_FIABILITE: Record<number, string> = {
  4: 'certain',
  3: 'probable',
  2: 'à confirmer',
  1: 'douteux',
};

/**
 * Pastille de fiabilité.
 *
 * Discrète, et **jamais réduite à sa couleur** : elle porte toujours son texte,
 * faute de quoi elle serait illisible pour qui distingue mal les teintes. La
 * source s'affiche au survol — la valeur prime sur ses métadonnées, qui ne
 * doivent pas encombrer le flux.
 */
export function PastilleFiabilite({
  niveau,
  source,
}: {
  niveau: number;
  source?: string;
}) {
  return (
    <span
      className={styles.fiabilite}
      data-niveau={niveau}
      title={source ? `Source — ${source}` : undefined}
    >
      {NIVEAUX_FIABILITE[niveau] ?? '—'}
    </span>
  );
}

/**
 * Pastille de visibilité.
 *
 * Neutre pour public — au point de ne rien afficher : signaler l'ordinaire
 * noierait le signal. Marquée pour restreint et privé, en famille froide, pour
 * ne pas se confondre avec l'échelle chaude de la fiabilité.
 */
export function PastilleVisibilite({ niveau }: { niveau: string }) {
  if (niveau === 'public') {
    return null;
  }

  return (
    <span className={styles.visibilite} data-niveau={niveau}>
      {niveau}
    </span>
  );
}

/** Légende de fiabilité, en pied de fiche. */
export function LegendeFiabilite() {
  return (
    <div className={styles.legende}>
      <span className={styles.legendeTitre}>Fiabilité</span>
      {[4, 3, 2, 1].map((niveau) => (
        <PastilleFiabilite key={niveau} niveau={niveau} />
      ))}
      <span className={styles.legendeNote}>
        Un chemin vaut son maillon le plus faible.
      </span>
    </div>
  );
}
