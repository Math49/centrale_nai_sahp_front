import styles from './formulaire.module.css';

export interface Impact {
  /** Entités déjà persistées par les sous-formulaires validés. */
  entitesCreees: number;
  /** Entités restant à écrire — au moins celle qu'on saisit. */
  entitesRestantes: number;
  liensRestants: number;
}

/**
 * Compteur d'impact, en pied de formulaire.
 *
 * Il reflète **l'état réel de la saisie** : les entités déjà persistées par les
 * sous-formulaires validés ne sont pas comptées comme restant à faire.
 * Annoncer un total figé au moment d'ouvrir le formulaire mentirait dès la
 * première cascade.
 */
export function CompteurImpact({ impact }: { impact: Impact }) {
  const morceaux: string[] = [];

  if (impact.entitesCreees > 0) {
    morceaux.push(
      `${impact.entitesCreees} entité${impact.entitesCreees > 1 ? 's' : ''} créée${
        impact.entitesCreees > 1 ? 's' : ''
      }`,
    );
  }

  const restants: string[] = [];

  if (impact.entitesRestantes > 0) {
    restants.push(
      `${impact.entitesRestantes} entité${impact.entitesRestantes > 1 ? 's' : ''}`,
    );
  }

  if (impact.liensRestants > 0) {
    restants.push(
      `${impact.liensRestants} lien${impact.liensRestants > 1 ? 's' : ''}`,
    );
  }

  if (restants.length > 0) {
    morceaux.push(
      `${restants.join(' et ')} restant${restants.length > 1 || impact.entitesRestantes > 1 ? 's' : ''}`,
    );
  }

  return (
    <p className={styles.compteur} aria-live="polite">
      {morceaux.length > 0 ? morceaux.join(', ') : 'Rien à enregistrer.'}
    </p>
  );
}
