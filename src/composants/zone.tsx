import styles from './zone.module.css';

/**
 * En-tête d'une zone. Casse de phrase, pas de majuscules décoratives.
 *
 * `lot` indique ce qui reste à venir. Il disparaîtra à mesure que les zones se
 * remplissent : c'est un repère de chantier, pas un élément d'interface.
 */
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
