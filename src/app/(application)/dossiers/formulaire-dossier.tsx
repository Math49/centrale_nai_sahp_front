'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCreerDossier } from '@/api/dossiers';
import { useEntites } from '@/api/entites';
import { useSession } from '@/auth/use-session';
import { ChampTexte } from '@/composants/champ-texte';
import controles from '@/composants/controles.module.css';
import { Modale } from '@/composants/modale';
import styles from './dossiers.module.css';

const VISIBILITES = [
  { valeur: 'public', libelle: 'Public — visible et lisible par tous' },
  { valeur: 'restreint', libelle: 'Restreint — visible, contenu fermé' },
  { valeur: 'prive', libelle: 'Privé — absent pour qui n’est pas habilité' },
] as const;

/**
 * Ouverture d'un dossier.
 *
 * L'donnée pivot est obligatoire : un dossier sans elle n'existe pas. Le
 * classement en restreint ou privé relève d'une permission à part — sans elle,
 * le choix ne s'affiche pas, plutôt que d'être proposé puis refusé.
 */
export function FormulaireDossier({ onCree }: { onCree: () => void }) {
  const router = useRouter();
  const creer = useCreerDossier();
  const { agent } = useSession();

  const [nom, definirNom] = useState('');
  const [note, definirNote] = useState('');
  const [visibilite, definirVisibilite] = useState<string>('public');
  const [recherche, definirRecherche] = useState('');
  const [pivot, definirPivot] = useState<{
    id: string;
    libelle: string;
  } | null>(null);
  const [recapitulatif, definirRecapitulatif] = useState(false);

  const candidats = useEntites({ q: recherche });

  const peutClasser =
    agent?.superAdmin || agent?.permissions.includes('visibilite.definir');

  const complet = nom.trim().length > 0 && pivot !== null;

  return (
    <div className={styles.formulaire}>
      <ChampTexte
        etiquette="Nom du dossier"
        valeur={nom}
        onChange={definirNom}
      />

      <div className={controles.groupe}>
        <span className={controles.etiquette}>Donnée pivot</span>

        {pivot ? (
          <div className={styles.pivotChoisi}>
            <span>{pivot.libelle}</span>
            <button
              type="button"
              className={styles.retirer}
              onClick={() => definirPivot(null)}
            >
              changer
            </button>
          </div>
        ) : (
          <>
            <input
              className={controles.champ}
              value={recherche}
              onChange={(evenement) => definirRecherche(evenement.target.value)}
              placeholder="Rechercher la donnée au cœur de l’enquête"
            />
            {recherche.trim().length > 0 && (
              <ul className={styles.suggestions}>
                {(candidats.data ?? []).slice(0, 6).map((entite) => (
                  <li key={entite.id}>
                    <button
                      type="button"
                      className={styles.suggestion}
                      onClick={() => {
                        definirPivot({
                          id: entite.id,
                          libelle: entite.libelle,
                        });
                        definirRecherche('');
                      }}
                    >
                      {entite.libelle}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <span className={controles.remarque}>
          Ouvrir le dossier reviendra à ouvrir sa fiche.
        </span>
      </div>

      {peutClasser && (
        <label className={controles.groupe}>
          <span className={controles.etiquette}>Visibilité</span>
          <select
            className={controles.champ}
            value={visibilite}
            onChange={(evenement) => definirVisibilite(evenement.target.value)}
          >
            {VISIBILITES.map((niveau) => (
              <option key={niveau.valeur} value={niveau.valeur}>
                {niveau.libelle}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className={controles.groupe}>
        <span className={controles.etiquette}>Note</span>
        <textarea
          className={styles.note}
          value={note}
          onChange={(evenement) => definirNote(evenement.target.value)}
          rows={3}
          placeholder="Ce que l’enquête cherche, sans prétendre le prouver."
        />
      </label>

      {creer.isError && (
        <p className={controles.erreur} role="alert">
          {creer.error.message}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={controles.bouton}
          disabled={!complet || creer.isPending}
          onClick={() => definirRecapitulatif(true)}
        >
          Ouvrir le dossier
        </button>
      </div>

      {recapitulatif && pivot && (
        <Modale
          titre={`Ouvrir le dossier « ${nom.trim()} » ?`}
          libelleConfirmation="Ouvrir"
          enCours={creer.isPending}
          onAnnuler={() => definirRecapitulatif(false)}
          onConfirmer={() =>
            creer.mutate(
              {
                nom: nom.trim(),
                entitePivotId: pivot.id,
                visibilite: visibilite as 'public' | 'restreint' | 'prive',
                note: note.trim() || undefined,
              },
              {
                onSuccess: (dossier) => {
                  definirRecapitulatif(false);
                  onCree();
                  router.push(`/dossiers/${dossier.id}`);
                },
              },
            )
          }
        >
          <p>
            Ancré sur <strong>{pivot.libelle}</strong>, qui entre aussitôt dans
            son suivi.
          </p>
          {visibilite !== 'public' && (
            <p>
              Les faits saisis depuis ce dossier en hériteront la visibilité.
              Les données, elles, gardent la leur.
            </p>
          )}
        </Modale>
      )}
    </div>
  );
}
