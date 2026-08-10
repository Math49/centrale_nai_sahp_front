'use client';

import Link from 'next/link';

import { useEntites } from '@/api/entites';
import { EtatVide } from '@/composants/etat-vide';
import { PastilleVisibilite } from '@/composants/pastilles';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';

/**
 * Archives.
 *
 * Rien n'est jamais supprimé : ce qui sort des écrans courants atterrit ici et
 * reste consultable. On y trouve aussi les fiches absorbées par une fusion,
 * qui redirigent vers celle qui subsiste.
 */
export default function PageArchives() {
  const archivees = useEntites({ etat: 'archive' });

  if (archivees.data && archivees.data.length === 0) {
    return (
      <>
        <Entete />
        <EtatVide
          titre="Aucune fiche archivée."
          explication="Archiver sort une fiche des écrans courants sans rien effacer : ses faits restent intacts et sa page reste ouverte."
        />
      </>
    );
  }

  return (
    <>
      <Entete />

      <div className={styles.panneau}>
        <table className={styles.tableau}>
          <thead>
            <tr>
              <th>Fiche</th>
              <th>Type</th>
              <th>Sort</th>
            </tr>
          </thead>
          <tbody>
            {(archivees.data ?? []).map((entite) => (
              <tr key={entite.id}>
                <td>
                  <Link href={`/entites/${entite.id}`}>{entite.libelle}</Link>
                </td>
                <td>
                  <span className={styles.domaine}>{entite.typeCode}</span>
                </td>
                <td>
                  <span className={styles.marqueurs}>
                    <span className={styles.marqueur}>archivée</span>
                    <PastilleVisibilite niveau={entite.visibilite} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Entete() {
  return (
    <EnteteZone
      titre="Archives"
      sousTitre="Rien n’est jamais supprimé : tout est archivé, infirmé ou anonymisé, et reste consultable. Une fiche absorbée par une fusion se retrouve ici, et redirige vers celle qui subsiste."
    />
  );
}
