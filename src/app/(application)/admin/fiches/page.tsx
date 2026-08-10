'use client';

import { useState } from 'react';

import {
  liensDisponiblesPour,
  useComposerOnglet,
  useCreerOnglet,
  useOrdonnerOnglets,
  useReferentiel,
  useSupprimerOnglet,
  type Onglet,
  type SensLien,
  type TypeEntite,
  type TypeLien,
} from '@/api/referentiel';
import { GardeSuperAdmin } from '@/auth/garde-super-admin';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { ListeReordonnable } from '@/composants/liste-reordonnable';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';

export default function PageFiches() {
  return (
    <GardeSuperAdmin>
      <Atelier />
    </GardeSuperAdmin>
  );
}

function Atelier() {
  const referentiel = useReferentiel();
  const [choisi, definirChoisi] = useState<string | null>(null);

  const types = referentiel.data?.typesEntites ?? [];
  const liens = referentiel.data?.typesLiens ?? [];
  const type = types.find((candidat) => candidat.id === choisi) ?? null;

  return (
    <>
      <EnteteZone
        titre="Mise en page des fiches"
        sousTitre="Quels onglets sur chaque type de donnée, quels types de liens chacun regroupe, et dans quel ordre."
      />

      <div className={styles.atelier}>
        <div className={styles.colonne}>
          <p className={styles.section}>Type de donnée</p>

          {types.length === 0 ? (
            <EtatVide
              titre="Aucun type de donnée."
              explication="Les onglets se posent sur un type, et il n'y en a pas encore."
            />
          ) : (
            <div className={styles.colonne}>
              {types.map((candidat) => (
                <button
                  key={candidat.id}
                  type="button"
                  className={styles.ligneChoisissable}
                  aria-pressed={candidat.id === choisi}
                  onClick={() => definirChoisi(candidat.id)}
                >
                  <span className={styles.entreeLibelle}>
                    {candidat.libelle}
                  </span>{' '}
                  <span className={styles.entreeDetail}>
                    {candidat.onglets.length} onglet
                    {candidat.onglets.length > 1 ? 's' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.colonne}>
          {type ? (
            <PanneauOnglets type={type} liens={liens} />
          ) : (
            <EtatVide
              titre="Choisir un type de donnée."
              explication="Sa fiche se compose ici, onglet par onglet."
            />
          )}
        </div>
      </div>
    </>
  );
}

function PanneauOnglets({
  type,
  liens,
}: {
  type: TypeEntite;
  liens: TypeLien[];
}) {
  const creer = useCreerOnglet();
  const ordonner = useOrdonnerOnglets();
  const [libelle, definirLibelle] = useState('');

  return (
    <>
      <div className={styles.panneau}>
        <p className={styles.section}>Onglets de la fiche {type.libelle}</p>

        {type.onglets.length === 0 ? (
          <p className={controles.remarque}>
            Aucun onglet. Le bloc d&apos;identité s&apos;affichera seul.
          </p>
        ) : (
          <ListeReordonnable
            elements={type.onglets}
            desactive={ordonner.isPending}
            onOrdonner={(ids) =>
              ordonner.mutate({ typeEntiteId: type.id, ids })
            }
            rendu={(onglet) => (
              <div className={styles.entreeListe}>
                <span className={styles.entreeLibelle}>{onglet.libelle}</span>
                <span className={styles.entreeDetail}>
                  {onglet.typesLiens.length} type
                  {onglet.typesLiens.length > 1 ? 's' : ''} de lien
                </span>
              </div>
            )}
          />
        )}

        <form
          className={styles.formulaireEnLigne}
          onSubmit={(evenement) => {
            evenement.preventDefault();
            creer.mutate(
              { typeEntiteId: type.id, libelle },
              { onSuccess: () => definirLibelle('') },
            );
          }}
        >
          <label className={controles.groupe}>
            <span className={controles.etiquette}>Nouvel onglet</span>
            <input
              className={controles.champ}
              value={libelle}
              onChange={(evenement) => definirLibelle(evenement.target.value)}
              placeholder="Personnes"
              required
            />
          </label>
          <button
            type="submit"
            className={controles.bouton}
            disabled={creer.isPending}
          >
            Ajouter
          </button>
        </form>

        {creer.isError && (
          <p className={controles.erreur} role="alert">
            {creer.error.message}
          </p>
        )}
      </div>

      {type.onglets.map((onglet) => (
        <CompositionOnglet
          key={onglet.id}
          onglet={onglet}
          type={type}
          liens={liens}
        />
      ))}
    </>
  );
}

interface Entree {
  typeLienId: string;
  sens: SensLien;
}

function CompositionOnglet({
  onglet,
  type,
  liens,
}: {
  onglet: Onglet;
  type: TypeEntite;
  liens: TypeLien[];
}) {
  const composer = useComposerOnglet();
  const supprimer = useSupprimerOnglet();
  const [aSupprimer, definirASupprimer] = useState(false);

  const candidats = liensDisponiblesPour(type, liens);

  const contient = (entree: Entree): boolean =>
    onglet.typesLiens.some(
      (present) =>
        present.typeLienId === entree.typeLienId &&
        present.sens === entree.sens,
    );

  const enregistrer = (entrees: Entree[]): void => {
    composer.mutate({ id: onglet.id, typesLiens: entrees });
  };

  const actuelles: Entree[] = onglet.typesLiens.map((entree) => ({
    typeLienId: entree.typeLienId,
    sens: entree.sens,
  }));

  const decrire = (entree: Entree): string => {
    const lien = liens.find((candidat) => candidat.id === entree.typeLienId);
    if (!lien) {
      return 'lien inconnu';
    }
    return entree.sens === 'direct' ? lien.libelle : lien.libelleInverse;
  };

  return (
    <div className={styles.panneau}>
      <div
        className={styles.actionsLigne}
        style={{ justifyContent: 'space-between' }}
      >
        <p className={styles.section}>Onglet {onglet.libelle}</p>
        <button
          type="button"
          className={styles.retirer}
          onClick={() => definirASupprimer(true)}
        >
          Retirer l&apos;onglet
        </button>
      </div>

      {actuelles.length === 0 ? (
        <p className={controles.remarque}>
          Onglet vide — il n&apos;affichera rien tant qu&apos;aucun type de lien
          ne lui est rattaché.
        </p>
      ) : (
        <ListeReordonnable
          elements={actuelles.map((entree) => ({
            ...entree,
            id: `${entree.typeLienId}:${entree.sens}`,
          }))}
          desactive={composer.isPending}
          onOrdonner={(ids) =>
            enregistrer(
              ids.map((identifiant) => {
                const [typeLienId, sens] = identifiant.split(':');
                return { typeLienId, sens: sens as SensLien };
              }),
            )
          }
          rendu={(entree) => (
            <div className={styles.entreeListe}>
              <span className={styles.entreeLibelle}>{decrire(entree)}</span>
              <span className={styles.marqueur}>{entree.sens}</span>
              <button
                type="button"
                className={styles.retirer}
                onClick={() =>
                  enregistrer(
                    actuelles.filter(
                      (autre) =>
                        !(
                          autre.typeLienId === entree.typeLienId &&
                          autre.sens === entree.sens
                        ),
                    ),
                  )
                }
              >
                Retirer
              </button>
            </div>
          )}
        />
      )}

      <div>
        <p className={controles.etiquette} style={{ marginBottom: 8 }}>
          Types de liens disponibles pour ce type de donnée
        </p>

        {candidats.length === 0 ? (
          <p className={controles.remarque}>
            Aucun type de lien ne touche {type.libelle}.
          </p>
        ) : (
          <div className={styles.actionsLigne} style={{ flexWrap: 'wrap' }}>
            {candidats.map((candidat) => {
              const entree: Entree = {
                typeLienId: candidat.lien.id,
                sens: candidat.sens,
              };
              const dejaLa = contient(entree);

              return (
                <button
                  key={`${candidat.lien.id}:${candidat.sens}`}
                  type="button"
                  className={styles.retirer}
                  disabled={dejaLa || composer.isPending}
                  onClick={() => enregistrer([...actuelles, entree])}
                  title={`${type.libelle} ${candidat.libelleLu} …`}
                >
                  {dejaLa ? '✓ ' : '+ '}
                  {candidat.libelleLu}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {composer.isError && (
        <p className={controles.erreur} role="alert">
          {composer.error.message}
        </p>
      )}

      {aSupprimer && (
        <Modale
          titre={`Retirer l'onglet « ${onglet.libelle} » ?`}
          irreversible
          enCours={supprimer.isPending}
          libelleConfirmation="Retirer"
          onAnnuler={() => definirASupprimer(false)}
          onConfirmer={() =>
            supprimer.mutate(onglet.id, {
              onSuccess: () => definirASupprimer(false),
            })
          }
        >
          <p>
            Les liens qu&apos;il regroupait restent en base : seul leur
            regroupement disparaît de la fiche.
          </p>
        </Modale>
      )}
    </div>
  );
}
