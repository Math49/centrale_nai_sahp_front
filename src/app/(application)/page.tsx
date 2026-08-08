'use client';

import { useSession } from '@/auth/use-session';
import { EtatVide } from '@/composants/etat-vide';
import { EnteteZone } from '@/composants/zone';
import styles from './accueil.module.css';

export default function PageAccueil() {
  const { agent } = useSession();

  return (
    <>
      <EnteteZone
        titre={`Bonjour, ${agent?.prenom ?? ''}`}
        sousTitre="Ce que la centrale a remarqué depuis votre dernier passage."
      />

      <div className={styles.grille}>
        <section className={styles.colonne}>
          <h2 className={styles.section}>Signaux</h2>
          <EtatVide
            titre="Aucun signal pour le moment."
            explication="Recoupements, récurrences et faits à confirmer non revus apparaîtront ici, calculés après application des règles de visibilité."
          />
        </section>

        <section className={styles.colonne}>
          <h2 className={styles.section}>Mes dossiers</h2>
          <EtatVide
            titre="Aucun dossier ouvert."
            explication="Un dossier est un périmètre d'enquête ancré sur une entité pivot."
          />
        </section>

        <section className={styles.colonne}>
          <h2 className={styles.section}>Dernière activité</h2>
          <EtatVide
            titre="Rien de neuf."
            explication="Les faits saisis récemment par le service s'afficheront ici."
          />
        </section>
      </div>
    </>
  );
}
