import styles from './pastilles.module.css';

export const NIVEAUX_FIABILITE: Record<number, string> = {
  4: 'certain',
  3: 'probable',
  2: 'à confirmer',
  1: 'douteux',
};

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
