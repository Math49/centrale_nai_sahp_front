'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  useEntite,
  useFusionner,
  useSimilaires,
  type SuggestionDoublon,
} from '@/api/entites';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from './fusion.module.css';

/**
 * Fusion de doublons.
 *
 * La fiche ouverte est **absorbée** ; celle que l'agent choisit subsiste. Le
 * sens est celui de la redirection : l'absorbée reste en base, archivée, et
 * pointe vers l'autre — un ancien lien vers elle continue de mener quelque
 * part.
 *
 * Le sens compte assez pour que l'écran le répète à chaque étape, y compris
 * dans la modale : se tromper de côté déplacerait l'enquête sur la mauvaise
 * fiche, et rien ne serait perdu, mais tout serait au mauvais endroit.
 */
export default function PageFusion() {
  const id = useParams<{ id: string }>().id;
  const router = useRouter();

  const fiche = useEntite(id);
  const fusionner = useFusionner();

  const [recherche, definirRecherche] = useState('');
  const [choisie, definirChoisie] = useState<SuggestionDoublon | null>(null);
  const [confirmation, definirConfirmation] = useState(false);

  const suggestions = useSimilaires(
    recherche || (fiche.data?.libelle ?? ''),
    fiche.data?.typeEntiteId,
  );

  if (!fiche.data) {
    return <p className={controles.remarque}>Chargement…</p>;
  }

  const entite = fiche.data;

  // On ne se fusionne pas avec soi-même, ni avec une fiche déjà absorbée.
  const candidates = (suggestions.data ?? []).filter(
    (candidate) => candidate.id !== id,
  );

  return (
    <>
      <EnteteZone
        titre={`Fusionner « ${entite.libelle} »`}
        sousTitre="Cette fiche sera absorbée par celle que vous choisissez. Ses faits, ses fichiers, ses suivis et ses habilitations y passent ; elle reste en base, archivée, et redirige vers celle qui subsiste."
      />

      <div className={styles.colonnes}>
        <section className={styles.panneau}>
          <h2 className={styles.section}>Fiche absorbée</h2>
          <p className={styles.libelle}>{entite.libelle}</p>
          <p className={controles.remarque}>{entite.typeLibelle}</p>
          <p className={styles.sens}>
            Elle cessera d’apparaître dans les écrans courants.
          </p>
        </section>

        <section className={styles.panneau}>
          <h2 className={styles.section}>Fiche conservée</h2>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>
              Chercher la fiche à conserver
            </span>
            <input
              className={controles.champ}
              value={recherche}
              onChange={(evenement) => {
                definirRecherche(evenement.target.value);
                definirChoisie(null);
              }}
              placeholder={entite.libelle}
            />
          </label>

          {candidates.length === 0 ? (
            <EtatVide
              titre="Aucune fiche approchante."
              explication="La recherche part du libellé et des valeurs uniques du même type de donnée. Une fiche que vous n’avez pas le droit de voir n’y figure jamais."
            />
          ) : (
            <ul className={styles.candidates}>
              {candidates.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    type="button"
                    className={styles.candidate}
                    aria-pressed={choisie?.id === candidate.id}
                    onClick={() => definirChoisie(candidate)}
                  >
                    <span>{candidate.libelle}</span>
                    <span className={controles.remarque}>
                      {candidate.valeurUniqueIdentique
                        ? 'même valeur unique'
                        : 'libellé proche'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className={styles.actions}>
        <Link className={controles.boutonDiscret} href={`/entites/${id}`}>
          Revenir à la fiche
        </Link>
        <button
          type="button"
          className={controles.bouton}
          disabled={choisie === null}
          onClick={() => definirConfirmation(true)}
        >
          Fusionner
        </button>
      </div>

      {confirmation && choisie && (
        <Modale
          titre="Fusionner ces deux fiches ?"
          libelleConfirmation="Fusionner"
          irreversible
          enCours={fusionner.isPending}
          onAnnuler={() => definirConfirmation(false)}
          onConfirmer={() =>
            fusionner.mutate(
              { id, versId: choisie.id },
              {
                onSuccess: () => {
                  definirConfirmation(false);
                  router.push(`/entites/${choisie.id}`);
                },
              },
            )
          }
        >
          <p>
            <strong>{entite.libelle}</strong> sera absorbée par{' '}
            <strong>{choisie.libelle}</strong>.
          </p>
          <p>
            Tout ce qu’elle porte — faits, fichiers, suivis, habilitations, et
            les dossiers qui l’avaient prise pour pivot — passe sur la fiche
            conservée. Rien n’est supprimé : l’absorbée reste consultable et
            redirige.
          </p>
          <p className={controles.remarque}>
            Les liens qui reliaient les deux fiches entre elles sont infirmés :
            une fois fusionnées, ils relieraient la donnée à elle-même.
          </p>

          {fusionner.isError && (
            <p className={controles.erreur}>{fusionner.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}
