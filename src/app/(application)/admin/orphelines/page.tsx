'use client';

import Link from 'next/link';

import { useOrphelines } from '@/api/journal';
import { EtatVide } from '@/composants/etat-vide';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';

/**
 * Données orphelines.
 *
 * Une coupure brutale pendant une saisie en cascade peut laisser une fiche sans
 * aucun lien. L'étude du besoin en veut une **liste discrète en
 * administration**, et surtout pas un signal sur l'accueil : ce n'est pas un
 * rapprochement, c'est du ménage.
 */
export default function PageOrphelines() {
  const orphelines = useOrphelines();

  return (
    <>
      <EnteteZone
        titre="Données orphelines"
        sousTitre="Fiches sans aucun lien actif. Elles n’ont rien d’anormal en soi — une fiche peut attendre son premier rapprochement — mais une saisie interrompue en laisse aussi derrière elle."
      />

      {orphelines.data && orphelines.data.length === 0 ? (
        <EtatVide
          titre="Aucune fiche isolée."
          explication="Toutes les fiches actives sont reliées à au moins une autre."
        />
      ) : (
        <div className={styles.panneau}>
          <table className={styles.tableau}>
            <thead>
              <tr>
                <th>Fiche</th>
                <th>Type</th>
                <th>Ouverte le</th>
                <th>Par</th>
              </tr>
            </thead>
            <tbody>
              {(orphelines.data ?? []).map((entite) => (
                <tr key={entite.id}>
                  <td>
                    <Link href={`/entites/${entite.id}`}>{entite.libelle}</Link>
                  </td>
                  <td>
                    <span className={styles.domaine}>{entite.typeCode}</span>
                  </td>
                  <td>
                    <span className="mono">{entite.creeLe.slice(0, 10)}</span>
                  </td>
                  <td>{entite.auteur ?? 'agent supprimé'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
