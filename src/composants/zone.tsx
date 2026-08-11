import styles from './zone.module.css';

export function EnteteZone({
  titre,
  sousTitre,
  lot,
}: {
  titre: string;
  sousTitre?: string;
  lot?: string;
}) {
  return (
    <header className={styles.entete}>
      <h1 className={styles.titre}>{titre}</h1>
      {sousTitre && <p className={styles.sousTitre}>{sousTitre}</p>}
      {lot && <span className={styles.lot}>{lot}</span>}
    </header>
  );
}
