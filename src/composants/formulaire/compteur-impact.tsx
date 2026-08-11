import styles from './formulaire.module.css';

export interface Impact {
  entitesCreees: number;

  entitesRestantes: number;
  liensRestants: number;
}

export function CompteurImpact({ impact }: { impact: Impact }) {
  const morceaux: string[] = [];

  if (impact.entitesCreees > 0) {
    morceaux.push(
      `${impact.entitesCreees} donnée${impact.entitesCreees > 1 ? 's' : ''} créée${
        impact.entitesCreees > 1 ? 's' : ''
      }`,
    );
  }

  const restants: string[] = [];

  if (impact.entitesRestantes > 0) {
    restants.push(
      `${impact.entitesRestantes} donnée${impact.entitesRestantes > 1 ? 's' : ''}`,
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
