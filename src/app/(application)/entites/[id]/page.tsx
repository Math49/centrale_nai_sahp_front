'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import {
  useArchiverEntite,
  useCreerFait,
  useEntite,
  useHistorique,
  useModifierEntite,
  useModifierFait,
  type ChampDeFiche,
  type LienDeFiche,
} from '@/api/entites';
import {
  liensDisponiblesPour,
  useReferentiel,
  type DefinitionChamp,
  type SensLien,
} from '@/api/referentiel';
import { useSession } from '@/auth/use-session';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { BoutonInfirmer } from '@/composants/infirmation';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { Modale } from '@/composants/modale';
import { PanneauDossier } from '@/composants/panneau-dossier';
import { PiecesJointes } from '@/composants/pieces-jointes';
import { ChampDynamique } from '@/composants/formulaire/champ-dynamique';
import {
  ChampRelationnel,
  type EntiteChoisie,
} from '@/composants/formulaire/champ-relationnel';
import {
  NIVEAUX_FIABILITE,
  LegendeFiabilite,
  PastilleFiabilite,
  PastilleVisibilite,
} from '@/composants/pastilles';
import styles from './fiche.module.css';

const HISTORIQUE = 'historique';
const VISIBILITES = ['public', 'restreint', 'prive'] as const;
const FIABILITES = [4, 3, 2, 1] as const;

const LIBELLES_VISIBILITE: Record<(typeof VISIBILITES)[number], string> = {
  public: 'Public',
  restreint: 'Restreint',
  prive: 'Privé',
};

export default function PageFiche() {
  return (
    <Suspense fallback={<p className={controles.remarque}>Chargement…</p>}>
      <Fiche />
    </Suspense>
  );
}

function Fiche() {
  const parametres = useParams<{ id: string }>();
  const id = parametres.id;

  const dossierOuvert = useSearchParams().get('dossier');

  const { agent } = useSession();
  const referentiel = useReferentiel();
  const fiche = useEntite(id);
  const modifier = useModifierEntite();
  const modifierFait = useModifierFait();
  const creerFait = useCreerFait();
  const archiver = useArchiverEntite();

  const [ongletActif, definirOngletActif] = useState<string | null>(null);
  const [note, definirNote] = useState<string | null>(null);
  const [visibilite, definirVisibilite] = useState<string | null>(null);
  const [editionChamp, definirEditionChamp] = useState<{
    faitId?: string;
    champ: ChampDeFiche;
    definition: DefinitionChamp;
    valeur: unknown;
    source: string;
    fiabilite: number;
    dateConstatation: string;
    visibilite: (typeof VISIBILITES)[number];
  } | null>(null);
  const [creationLien, definirCreationLien] = useState<{
    typeLienId: string;
    sens: SensLien;
    cible: EntiteChoisie | null;
    source: string;
    fiabilite: number;
    dateConstatation: string;
    visibilite: (typeof VISIBILITES)[number];
  } | null>(null);
  const [confirmation, definirConfirmation] = useState(false);

  const peutVoirLHistorique =
    agent?.superAdmin || agent?.permissions.includes('historique.consulter');

  const peutInfirmer =
    agent?.superAdmin || agent?.permissions.includes('fait.infirmer') || false;
  const peutModifierFait =
    agent?.superAdmin || agent?.permissions.includes('fait.modifier') || false;
  const peutCreerFait =
    agent?.superAdmin || agent?.permissions.includes('fait.creer') || false;
  const peutFusionner =
    agent?.superAdmin || agent?.permissions.includes('entite.fusionner');
  const peutDeposer =
    agent?.superAdmin || agent?.permissions.includes('fait.creer') || false;

  const historique = useHistorique(id, ongletActif === HISTORIQUE);
  const entite = fiche.data;
  const type = referentiel.data?.typesEntites.find(
    (candidat) => candidat.id === entite?.typeEntiteId,
  );
  const candidatsLiens = type
    ? liensDisponiblesPour(type, referentiel.data?.typesLiens ?? [])
    : [];

  useEffect(() => {
    if (!entite) {
      return;
    }

    definirNote(null);
    definirVisibilite(null);
    definirEditionChamp(null);
    definirCreationLien(null);
  }, [entite]);

  if (fiche.isError) {
    return (
      <EtatVide
        titre="Cette fiche n’existe pas."
        explication="Elle a peut-être été fusionnée, ou vous n’y avez pas accès — la centrale ne fait pas la différence, à dessein."
        action={
          <Link className={controles.bouton} href="/entites">
            Revenir à l’annuaire
          </Link>
        }
      />
    );
  }

  if (!entite) {
    return <p className={controles.remarque}>Chargement…</p>;
  }

  const onglets = entite.onglets;
  const actif = ongletActif ?? onglets[0]?.id ?? HISTORIQUE;

  const noteAffichee = note ?? entite.note ?? '';
  const noteModifiee = note !== null && note !== (entite.note ?? '');
  const visibiliteAffichee = visibilite ?? entite.visibilite;
  const visibiliteModifiee =
    visibilite !== null && visibilite !== entite.visibilite;
  const lienSelectionne = creationLien
    ? candidatsLiens.find(
        (candidat) =>
          candidat.lien.id === creationLien.typeLienId &&
          candidat.sens === creationLien.sens,
      )
    : undefined;
  const typeCibleId = lienSelectionne
    ? lienSelectionne.sens === 'direct'
      ? lienSelectionne.lien.typeEntiteCibleId
      : lienSelectionne.lien.typeEntiteSourceId
    : null;
  const typeCible = referentiel.data?.typesEntites.find(
    (candidat) => candidat.id === typeCibleId,
  );
  const peutAjouterLien =
    peutCreerFait &&
    entite.fusionneeVersId === null &&
    candidatsLiens.length > 0;
  const ouvrirCreationLien = () => {
    const premier = candidatsLiens[0];

    if (!premier) {
      return;
    }

    definirCreationLien({
      typeLienId: premier.lien.id,
      sens: premier.sens,
      cible: null,
      source: '',
      fiabilite: 3,
      dateConstatation: new Date().toISOString().slice(0, 10),
      visibilite: entite.visibilite,
    });
  };

  return (
    <>
      {dossierOuvert && <PanneauDossier dossierId={dossierOuvert} />}

      {}
      {entite.fusionneeVersId && (
        <p className={styles.redirection}>
          Cette fiche a été fusionnée.{' '}
          <Link
            className={styles.rattachement}
            href={`/entites/${entite.fusionneeVersId}`}
          >
            Ouvrir la fiche qui subsiste
          </Link>
        </p>
      )}

      <header className={styles.entete}>
        <div className={styles.identite}>
          <span className={styles.typeEntite}>
            {type && <IconeFontAwesome valeur={type.icone} taille={14} />}
            {entite.typeLibelle}
          </span>
          <h1 className={styles.titre}>{entite.libelle}</h1>
          <div className={styles.marques}>
            <PastilleVisibilite niveau={entite.visibilite} />
            {entite.etat === 'archive' && (
              <span className={styles.archive}>archivée</span>
            )}
            {!entite.contenuLisible && (
              <span className={styles.restreint}>contenu restreint</span>
            )}
          </div>

          {}
          {entite.dossiers.length > 0 && (
            <p className={styles.rattachements}>
              Suivie par{' '}
              {entite.dossiers.map((dossier, rang) => (
                <span key={dossier.id}>
                  {rang > 0 && ', '}
                  <Link
                    className={styles.rattachement}
                    href={`/entites/${id}?dossier=${dossier.id}`}
                  >
                    {dossier.nom}
                  </Link>
                  {dossier.estPivot && (
                    <span className={styles.pivot}> (pivot)</span>
                  )}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className={styles.actionsEntete}>
          {peutFusionner && entite.fusionneeVersId === null && (
            <Link
              className={controles.boutonDiscret}
              href={`/entites/${id}/fusion`}
            >
              Fusionner
            </Link>
          )}
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => definirConfirmation(true)}
          >
            {entite.etat === 'archive' ? 'Désarchiver' : 'Archiver'}
          </button>
        </div>
      </header>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>Identité</h2>

        <dl className={styles.champs}>
          {entite.champs.map((champ) => {
            const definition = type?.champs.find(
              (candidat) => candidat.id === champ.definitionChampId,
            );
            const fait = champ.faits[0];
            const peutModifierChamp =
              definition !== undefined &&
              ((fait !== undefined && peutModifierFait) ||
                (fait === undefined && peutCreerFait));

            return (
              <LigneChamp
                key={champ.definitionChampId}
                champ={champ}
                peutInfirmer={peutInfirmer}
                peutModifier={peutModifierChamp}
                onModifier={() => {
                  if (!definition) {
                    return;
                  }

                  definirEditionChamp({
                    faitId: fait?.id,
                    champ,
                    definition,
                    valeur: fait?.valeur,
                    source: fait?.source ?? '',
                    fiabilite: fait?.fiabilite ?? 3,
                    dateConstatation:
                      fait?.dateConstatation.slice(0, 10) ??
                      new Date().toISOString().slice(0, 10),
                    visibilite: fait?.visibilite ?? entite.visibilite,
                  });
                }}
              />
            );
          })}
        </dl>
      </section>

      <div className={styles.barreOnglets}>
        <nav className={styles.onglets} aria-label="Onglets de la fiche">
          {onglets.map((onglet) => (
            <button
              key={onglet.id}
              type="button"
              className={styles.onglet}
              aria-current={actif === onglet.id ? 'true' : undefined}
              onClick={() => definirOngletActif(onglet.id)}
            >
              {onglet.libelle}
              <span className={styles.compteur}>{onglet.compteur}</span>
            </button>
          ))}

          {peutVoirLHistorique && (
            <button
              type="button"
              className={styles.onglet}
              aria-current={actif === HISTORIQUE ? 'true' : undefined}
              onClick={() => definirOngletActif(HISTORIQUE)}
            >
              Historique
            </button>
          )}
        </nav>

        {peutAjouterLien && (
          <button
            type="button"
            className={controles.bouton}
            onClick={ouvrirCreationLien}
          >
            Ajouter un lien
          </button>
        )}
      </div>

      <section className={styles.bloc}>
        {actif === HISTORIQUE ? (
          <Historique
            evenements={historique.data ?? []}
            enCours={historique.isLoading}
          />
        ) : (
          <ContenuOnglet
            liens={onglets.find((onglet) => onglet.id === actif)?.liens ?? []}
            peutInfirmer={peutInfirmer}
          />
        )}
      </section>

      {entite.liensHorsOnglet.length > 0 && (
        <section className={styles.bloc}>
          <h2 className={styles.blocTitre}>Liens hors onglet</h2>
          <p className={controles.remarque}>
            Aucun onglet ne regroupe ces types de liens. La mise en page des
            fiches se règle en administration.
          </p>
          <ContenuOnglet
            liens={entite.liensHorsOnglet}
            peutInfirmer={peutInfirmer}
          />
        </section>
      )}

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>Pièces jointes</h2>
        <PiecesJointes entiteId={id} peutDeposer={peutDeposer} />
      </section>

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>Note</h2>
        <p className={controles.remarque}>
          Champ libre, sans historique ni signature. Elle ne porte ni source ni
          fiabilité : ce n’est pas un fait. La visibilité se règle ici aussi.
        </p>
        <div className={styles.edition}>
          <label className={controles.groupe}>
            <span className={controles.etiquette}>Visibilité</span>
            <select
              className={controles.champ}
              value={visibiliteAffichee}
              onChange={(evenement) =>
                definirVisibilite(evenement.target.value)
              }
            >
              {VISIBILITES.map((niveau) => (
                <option key={niveau} value={niveau}>
                  {LIBELLES_VISIBILITE[niveau]}
                </option>
              ))}
            </select>
          </label>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Note</span>
            <textarea
              className={styles.note}
              value={noteAffichee}
              onChange={(evenement) => definirNote(evenement.target.value)}
              rows={4}
              placeholder="Ce que l’enquête retient, sans prétendre le prouver."
            />
          </label>
        </div>

        {(noteModifiee || visibiliteModifiee) && (
          <div className={styles.actionsEntete}>
            <button
              type="button"
              className={controles.boutonDiscret}
              onClick={() => {
                definirNote(null);
                definirVisibilite(null);
              }}
            >
              Abandonner
            </button>
            <button
              type="button"
              className={controles.bouton}
              disabled={modifier.isPending}
              onClick={() =>
                modifier.mutate(
                  {
                    id,
                    ...(noteModifiee ? { note: noteAffichee } : {}),
                    ...(visibiliteModifiee
                      ? { visibilite: visibiliteAffichee }
                      : {}),
                  },
                  {
                    onSuccess: () => {
                      definirNote(null);
                      definirVisibilite(null);
                    },
                  },
                )
              }
            >
              Enregistrer les modifications
            </button>
          </div>
        )}
      </section>

      <LegendeFiabilite />

      {editionChamp && (
        <Modale
          titre={`${editionChamp.faitId ? 'Modifier' : 'Renseigner'} "${editionChamp.champ.libelle}"`}
          libelleConfirmation="Enregistrer"
          enCours={modifierFait.isPending || creerFait.isPending}
          confirmationBloquee={
            editionChamp.source.trim().length === 0 ||
            editionChamp.valeur === null ||
            editionChamp.valeur === undefined ||
            editionChamp.valeur === ''
          }
          onAnnuler={() => definirEditionChamp(null)}
          onConfirmer={() => {
            const valeur = editionChamp.valeur as string | number | boolean;

            if (editionChamp.faitId) {
              modifierFait.mutate(
                {
                  id: editionChamp.faitId,
                  valeur,
                  source: editionChamp.source.trim(),
                  fiabilite: editionChamp.fiabilite,
                  dateConstatation: editionChamp.dateConstatation,
                  visibilite: editionChamp.visibilite,
                },
                { onSuccess: () => definirEditionChamp(null) },
              );
              return;
            }

            creerFait.mutate(
              {
                sujetId: id,
                nature: 'champ',
                definitionChampId: editionChamp.definition.id,
                valeur,
                source: editionChamp.source.trim(),
                fiabilite: editionChamp.fiabilite,
                dateConstatation: editionChamp.dateConstatation,
                visibilite: editionChamp.visibilite,
              },
              { onSuccess: () => definirEditionChamp(null) },
            );
          }}
        >
          <p className={controles.remarque}>
            {editionChamp.faitId
              ? 'La valeur affichee changera a partir du fait selectionne. Les autres sources restent intactes.'
              : 'Un fait source sera ajoute a cette fiche pour renseigner le champ.'}
          </p>

          <ChampDynamique
            champ={editionChamp.definition}
            valeur={editionChamp.valeur}
            onChange={(valeur) =>
              definirEditionChamp({ ...editionChamp, valeur })
            }
          />

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Source</span>
            <input
              className={controles.champ}
              value={editionChamp.source}
              onChange={(evenement) =>
                definirEditionChamp({
                  ...editionChamp,
                  source: evenement.target.value,
                })
              }
              placeholder="Observation, renseignement, dossier..."
            />
          </label>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Fiabilite</span>
            <select
              className={controles.champ}
              value={editionChamp.fiabilite}
              onChange={(evenement) =>
                definirEditionChamp({
                  ...editionChamp,
                  fiabilite: Number(evenement.target.value),
                })
              }
            >
              {FIABILITES.map((niveau) => (
                <option key={niveau} value={niveau}>
                  {niveau} - {NIVEAUX_FIABILITE[niveau]}
                </option>
              ))}
            </select>
          </label>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Date de constatation</span>
            <input
              className={controles.champMono}
              type="date"
              value={editionChamp.dateConstatation}
              onChange={(evenement) =>
                definirEditionChamp({
                  ...editionChamp,
                  dateConstatation: evenement.target.value,
                })
              }
            />
          </label>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Visibilite</span>
            <select
              className={controles.champ}
              value={editionChamp.visibilite}
              onChange={(evenement) =>
                definirEditionChamp({
                  ...editionChamp,
                  visibilite: evenement.target
                    .value as (typeof VISIBILITES)[number],
                })
              }
            >
              {VISIBILITES.map((niveau) => (
                <option key={niveau} value={niveau}>
                  {LIBELLES_VISIBILITE[niveau]}
                </option>
              ))}
            </select>
          </label>

          {(modifierFait.isError || creerFait.isError) && (
            <p className={controles.erreur} role="alert">
              {modifierFait.error?.message ?? creerFait.error?.message}
            </p>
          )}
        </Modale>
      )}

      {creationLien && (
        <Modale
          titre={`Ajouter un lien depuis "${entite.libelle}"`}
          libelleConfirmation="Ajouter le lien"
          enCours={creerFait.isPending}
          confirmationBloquee={
            !lienSelectionne ||
            !creationLien.cible ||
            creationLien.source.trim().length === 0
          }
          onAnnuler={() => definirCreationLien(null)}
          onConfirmer={() => {
            if (!lienSelectionne || !creationLien.cible) {
              return;
            }

            creerFait.mutate(
              {
                sujetId:
                  creationLien.sens === 'direct' ? id : creationLien.cible.id,
                nature: 'lien',
                typeLienId: creationLien.typeLienId,
                cibleId:
                  creationLien.sens === 'direct' ? creationLien.cible.id : id,
                source: creationLien.source.trim(),
                fiabilite: creationLien.fiabilite,
                dateConstatation: creationLien.dateConstatation,
                visibilite: creationLien.visibilite,
              },
              { onSuccess: () => definirCreationLien(null) },
            );
          }}
        >
          <label className={controles.groupe}>
            <span className={controles.etiquette}>Type de lien</span>
            <select
              className={controles.champ}
              value={`${creationLien.typeLienId}:${creationLien.sens}`}
              onChange={(evenement) => {
                const [typeLienId, sens] = evenement.target.value.split(':');

                definirCreationLien({
                  ...creationLien,
                  typeLienId,
                  sens: sens as SensLien,
                  cible: null,
                });
              }}
            >
              {candidatsLiens.map((candidat) => (
                <option
                  key={`${candidat.lien.id}:${candidat.sens}`}
                  value={`${candidat.lien.id}:${candidat.sens}`}
                >
                  {candidat.libelleLu}
                </option>
              ))}
            </select>
          </label>

          {lienSelectionne && typeCibleId && (
            <ChampRelationnel
              libelle={lienSelectionne.libelleLu}
              typeCibleId={typeCibleId}
              typeCibleLibelle={typeCible?.libelle ?? 'fiche'}
              multiple={false}
              choisis={creationLien.cible ? [creationLien.cible] : []}
              onAjouter={(cible) =>
                definirCreationLien({ ...creationLien, cible })
              }
              onRetirer={() =>
                definirCreationLien({ ...creationLien, cible: null })
              }
            />
          )}

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Source</span>
            <input
              className={controles.champ}
              value={creationLien.source}
              onChange={(evenement) =>
                definirCreationLien({
                  ...creationLien,
                  source: evenement.target.value,
                })
              }
              placeholder="Observation, renseignement, dossier..."
            />
          </label>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Fiabilite</span>
            <select
              className={controles.champ}
              value={creationLien.fiabilite}
              onChange={(evenement) =>
                definirCreationLien({
                  ...creationLien,
                  fiabilite: Number(evenement.target.value),
                })
              }
            >
              {FIABILITES.map((niveau) => (
                <option key={niveau} value={niveau}>
                  {niveau} - {NIVEAUX_FIABILITE[niveau]}
                </option>
              ))}
            </select>
          </label>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Date de constatation</span>
            <input
              className={controles.champMono}
              type="date"
              value={creationLien.dateConstatation}
              onChange={(evenement) =>
                definirCreationLien({
                  ...creationLien,
                  dateConstatation: evenement.target.value,
                })
              }
            />
          </label>

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Visibilite</span>
            <select
              className={controles.champ}
              value={creationLien.visibilite}
              onChange={(evenement) =>
                definirCreationLien({
                  ...creationLien,
                  visibilite: evenement.target
                    .value as (typeof VISIBILITES)[number],
                })
              }
            >
              {VISIBILITES.map((niveau) => (
                <option key={niveau} value={niveau}>
                  {LIBELLES_VISIBILITE[niveau]}
                </option>
              ))}
            </select>
          </label>

          {creerFait.isError && (
            <p className={controles.erreur} role="alert">
              {creerFait.error.message}
            </p>
          )}
        </Modale>
      )}

      {confirmation && (
        <Modale
          titre={
            entite.etat === 'archive'
              ? `Désarchiver « ${entite.libelle} » ?`
              : `Archiver « ${entite.libelle} » ?`
          }
          libelleConfirmation={
            entite.etat === 'archive' ? 'Désarchiver' : 'Archiver'
          }
          enCours={archiver.isPending}
          onAnnuler={() => definirConfirmation(false)}
          onConfirmer={() =>
            archiver.mutate(
              { id, archiver: entite.etat !== 'archive' },
              { onSuccess: () => definirConfirmation(false) },
            )
          }
        >
          <p>
            Rien n’est supprimé : la fiche sort des écrans courants et reste
            consultable, ses faits intacts.
          </p>
        </Modale>
      )}
    </>
  );
}

function LigneChamp({
  champ,
  peutInfirmer,
  peutModifier,
  onModifier,
}: {
  champ: ChampDeFiche;
  peutInfirmer: boolean;
  peutModifier: boolean;
  onModifier: () => void;
}) {
  const meilleur = champ.faits[0];

  return (
    <div className={styles.champ}>
      <dt className={styles.champLibelle}>{champ.libelle}</dt>
      <dd className={styles.champValeur}>
        {champ.valeur === null || champ.valeur === undefined ? (
          <span className={styles.vide}>non renseigné</span>
        ) : (
          <span className={champ.typeDonnee === 'texte' ? undefined : 'mono'}>
            {Array.isArray(champ.valeur)
              ? champ.valeur.map(String).join(' · ')
              : String(champ.valeur)}
          </span>
        )}

        {meilleur && (
          <PastilleFiabilite
            niveau={meilleur.fiabilite}
            source={meilleur.source}
          />
        )}

        {champ.multiSources && (
          <span
            className={styles.multiSources}
            title="Plusieurs sources distinctes affirment cette valeur"
          >
            {champ.faits.length} sources
          </span>
        )}

        {}
        {peutInfirmer && meilleur && (
          <BoutonInfirmer
            faitId={meilleur.id}
            quoi={`${champ.libelle} — ${String(meilleur.valeur ?? '')}`}
          />
        )}

        {peutModifier && (
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={onModifier}
          >
            {meilleur ? 'Modifier' : 'Renseigner'}
          </button>
        )}
      </dd>
    </div>
  );
}

function ContenuOnglet({
  liens,
  peutInfirmer,
}: {
  liens: LienDeFiche[];
  peutInfirmer: boolean;
}) {
  if (liens.length === 0) {
    return (
      <EtatVide
        titre="Rien ici pour le moment."
        explication="Un lien se pose en remplissant un champ relationnel, depuis l’une ou l’autre des deux fiches concernées."
      />
    );
  }

  return (
    <ul className={styles.liens}>
      {liens.map((lien) => (
        <li key={lien.faitId} className={styles.lien}>
          <span className={styles.lienLibelle}>{lien.libelle}</span>
          <Link
            className={styles.lienCible}
            href={`/entites/${lien.autreEntite.id}`}
          >
            {lien.autreEntite.libelle}
          </Link>
          <span className={styles.lienDate}>
            <span className="mono">{lien.dateConstatation}</span>
          </span>
          <PastilleFiabilite niveau={lien.fiabilite} source={lien.source} />
          <PastilleVisibilite niveau={lien.visibiliteEffective} />
          {peutInfirmer && (
            <BoutonInfirmer
              faitId={lien.faitId}
              quoi={`${lien.libelle} ${lien.autreEntite.libelle}`}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function Historique({
  evenements,
  enCours,
}: {
  evenements: {
    id: string;
    nature: string;
    libelle: string;
    auteur: string | null;
    survenuLe: string;
    fiabilite: number | null;
    source: string | null;
  }[];
  enCours: boolean;
}) {
  if (enCours) {
    return <p className={controles.remarque}>Chargement…</p>;
  }

  if (evenements.length === 0) {
    return (
      <EtatVide
        titre="Rien n’a encore été repris."
        explication="Les faits infirmés et les modifications s’inscriront ici. Rien n’est supprimé : tout reste consultable."
      />
    );
  }

  return (
    <ul className={styles.historique}>
      {evenements.map((evenement) => (
        <li key={`${evenement.nature}-${evenement.id}`} className={styles.lien}>
          <span className={styles.lienLibelle}>{evenement.libelle}</span>
          <span className={styles.lienDate}>
            <span className="mono">
              {evenement.survenuLe.slice(0, 16).replace('T', ' ')}
            </span>
          </span>
          <span className={styles.auteur}>{evenement.auteur ?? '—'}</span>
          {evenement.fiabilite !== null && (
            <PastilleFiabilite
              niveau={evenement.fiabilite}
              source={evenement.source ?? undefined}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
