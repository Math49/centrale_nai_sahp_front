'use client';

import { useMemo, useState } from 'react';

import {
  useAnnulerCreation,
  useCreerEntite,
  useCreerFait,
  useSimilaires,
  type SuggestionDoublon,
} from '@/api/entites';
import {
  liensDisponiblesPour,
  useReferentiel,
  type SensLien,
  type TypeEntite,
  type TypeLien,
} from '@/api/referentiel';
import controles from '../controles.module.css';
import { Modale } from '../modale';
import { AlerteDoublon } from './alerte-doublon';
import { BandeauSource, type SourceActive } from './bandeau-source';
import { ChampDynamique } from './champ-dynamique';
import { ChampRelationnel, type EntiteChoisie } from './champ-relationnel';
import { CompteurImpact } from './compteur-impact';
import styles from './formulaire.module.css';
import { libellePrevu } from './gabarit';
import { cleRelation, planDEcriture } from './plan-ecriture';

/** Profondeur maximale de la création en cascade. Au-delà, l'agent enregistre
 *  puis poursuit depuis la fiche créée. */
export const PROFONDEUR_MAXIMALE = 2;

export interface EntiteEnregistree {
  id: string;
  libelle: string;
}

/**
 * Registre partagé par toute la cascade.
 *
 * L'enregistrement est progressif : chaque sous-formulaire validé persiste son
 * entité. Abandonner une branche doit donc pouvoir retirer ce qu'elle a écrit,
 * et pas seulement ce que le dernier niveau a produit — d'où un registre unique
 * tenu à la racine, et des marques posées à l'ouverture de chaque niveau.
 */
export interface RegistreCascade {
  creees: EntiteEnregistree[];
  ajouter: (entite: EntiteEnregistree) => void;
  marque: () => number;
  annulerDepuis: (marque: number) => Promise<void>;
}

export function useRegistreCascade(): RegistreCascade {
  const [creees, definirCreees] = useState<EntiteEnregistree[]>([]);
  const annuler = useAnnulerCreation();

  return useMemo(
    () => ({
      creees,
      ajouter: (entite) => definirCreees((liste) => [...liste, entite]),
      marque: () => creees.length,
      annulerDepuis: async (marque) => {
        const aRetirer = creees.slice(marque);

        // À rebours : une entité créée plus tard peut désigner une plus
        // ancienne, et l'annulation refuse de retirer ce qui est désigné.
        for (const entite of [...aRetirer].reverse()) {
          await annuler.mutateAsync(entite.id).catch(() => undefined);
        }

        definirCreees((liste) => liste.slice(0, marque));
      },
    }),
    [creees, annuler],
  );
}

export interface HeritageCascade {
  /** Ce que le formulaire parent posera comme lien, une fois enregistré. */
  libelleLien: string;
  libelleParent: string;
}

interface Proprietes {
  typeEntiteId: string;
  source: SourceActive;
  onSourceChange: (source: SourceActive) => void;
  registre: RegistreCascade;

  /**
   * Dossier de saisie. Les faits en héritent la visibilité et l'entité entre
   * dans son suivi ; l'entité, elle, ne porte que la sienne.
   */
  dossierId?: string;

  profondeur?: number;
  heritage?: HeritageCascade;
  onEnregistre: (entite: EntiteEnregistree) => void;
  onAnnule: () => void;
}

/**
 * Moteur de formulaire dynamique.
 *
 * Il lit le référentiel et produit le formulaire de n'importe quel type
 * d'entité, champs relationnels compris. C'est la pièce la plus réutilisée du
 * front : la fiche, l'édition et la création en cascade en dépendent toutes.
 *
 * Le principe fondateur tient dans son comportement : **on décrit des entités,
 * les liens se construisent seuls**. L'agent ne trace jamais un lien à la main,
 * il remplit un champ.
 */
export function MoteurFormulaire({
  typeEntiteId,
  source,
  onSourceChange,
  registre,
  dossierId,
  profondeur = 0,
  heritage,
  onEnregistre,
  onAnnule,
}: Proprietes) {
  const referentiel = useReferentiel();
  const creerEntite = useCreerEntite();
  const creerFait = useCreerFait();

  const [valeurs, definirValeurs] = useState<Record<string, unknown>>({});
  const [relations, definirRelations] = useState<
    Record<string, EntiteChoisie[]>
  >({});
  const [cascade, definirCascade] = useState<{
    cle: string;
    typeCibleId: string;
    libelleLien: string;
  } | null>(null);
  const [recapitulatif, definirRecapitulatif] = useState(false);
  const [erreur, definirErreur] = useState<string | null>(null);

  const [marque] = useState(() => registre.marque());

  const type = referentiel.data?.typesEntites.find(
    (candidat) => candidat.id === typeEntiteId,
  );
  const candidats = useMemo(
    () =>
      type
        ? liensDisponiblesPour(type, referentiel.data?.typesLiens ?? [])
        : [],
    [type, referentiel.data],
  );

  const libelle = type ? libellePrevu(type, valeurs) : '';
  const doublons = useSimilaires(libelle, typeEntiteId);

  const nombreDeLiens = Object.values(relations).reduce(
    (total, liste) => total + liste.length,
    0,
  );

  if (referentiel.isLoading || !type) {
    return <p className={controles.remarque}>Chargement du référentiel…</p>;
  }

  const cleDe = (lien: TypeLien, sens: SensLien) => cleRelation(lien.id, sens);

  const choisir = (cle: string, entite: EntiteChoisie, multiple: boolean) => {
    definirRelations((etat) => ({
      ...etat,
      [cle]: multiple ? [...(etat[cle] ?? []), entite] : [entite],
    }));
  };

  const retirer = (cle: string, id: string) => {
    definirRelations((etat) => ({
      ...etat,
      [cle]: (etat[cle] ?? []).filter((element) => element.id !== id),
    }));
  };

  const enregistrer = async () => {
    definirErreur(null);

    try {
      const { champs, directs, inverses } = planDEcriture(
        type,
        candidats,
        valeurs,
        relations,
      );

      const entite = await creerEntite.mutateAsync({
        typeEntiteId,
        dossierId,
        ...source,
        champs,
        liens: directs,
      });

      for (const inverse of inverses) {
        await creerFait.mutateAsync({
          sujetId: inverse.sujetId,
          nature: 'lien',
          typeLienId: inverse.typeLienId,
          cibleId: entite.id,
          dossierId,
          ...source,
        });
      }

      const enregistree = { id: entite.id, libelle: entite.libelle };

      if (profondeur > 0) {
        registre.ajouter(enregistree);
      }

      definirRecapitulatif(false);
      onEnregistre(enregistree);
    } catch (echec) {
      definirErreur(
        echec instanceof Error ? echec.message : 'enregistrement impossible',
      );
      definirRecapitulatif(false);
    }
  };

  /**
   * Abandon : ce que la cascade a persisté depuis l'ouverture de ce niveau est
   * retiré. Ce qui a été validé plus haut reste.
   */
  const abandonner = async () => {
    await registre.annulerDepuis(marque);
    onAnnule();
  };

  const retenirLeDoublon = (suggestion: SuggestionDoublon) => {
    // Bascule de la création vers la sélection. Dans un sous-formulaire, le
    // parent reçoit la fiche existante comme s'il l'avait cherchée ; sa propre
    // saisie, elle, n'a jamais été touchée.
    onEnregistre({ id: suggestion.id, libelle: suggestion.libelle });
  };

  const typeDe = (id: string): TypeEntite | undefined =>
    referentiel.data?.typesEntites.find((candidat) => candidat.id === id);

  return (
    <div className={styles.formulaire}>
      <BandeauSource
        valeur={source}
        onChange={onSourceChange}
        fige={profondeur > 0}
      />

      {heritage && (
        <p className={styles.filDAriane}>
          Créée depuis <strong>{heritage.libelleParent}</strong> —{' '}
          <span className={styles.puceHeritee}>⌧ {heritage.libelleLien}</span>{' '}
          sera posé à l’enregistrement de la fiche d’origine.
        </p>
      )}

      <section className={styles.bloc}>
        <h2 className={styles.blocTitre}>Identité</h2>

        <div className={styles.grille}>
          {type.champs.map((champ) => (
            <ChampDynamique
              key={champ.id}
              champ={champ}
              valeur={valeurs[champ.cle]}
              onChange={(valeur) =>
                definirValeurs((etat) => ({ ...etat, [champ.cle]: valeur }))
              }
            />
          ))}
        </div>

        <p className={styles.apercuLibelle}>
          La fiche s’appellera <strong>{libelle || '—'}</strong>
        </p>

        <AlerteDoublon
          suggestions={doublons.data ?? []}
          onRetenir={retenirLeDoublon}
          libelleAction={
            profondeur > 0 ? 'retenir cette fiche' : 'ouvrir cette fiche'
          }
        />
      </section>

      {candidats.length > 0 && (
        <section className={styles.bloc}>
          <h2 className={styles.blocTitre}>Relations</h2>

          <div className={styles.grille}>
            {candidats.map((candidat) => {
              const cle = cleDe(candidat.lien, candidat.sens);
              const typeCibleId =
                candidat.sens === 'direct'
                  ? candidat.lien.typeEntiteCibleId
                  : candidat.lien.typeEntiteSourceId;
              const cible = typeDe(typeCibleId);

              const peutCascader = profondeur < PROFONDEUR_MAXIMALE - 1;

              return (
                <ChampRelationnel
                  key={cle}
                  libelle={candidat.libelleLu}
                  typeCibleId={typeCibleId}
                  typeCibleLibelle={cible?.libelle ?? '—'}
                  multiple={candidat.lien.multiple}
                  choisis={relations[cle] ?? []}
                  onAjouter={(entite) =>
                    choisir(cle, entite, candidat.lien.multiple)
                  }
                  onRetirer={(id) => retirer(cle, id)}
                  onCreer={
                    peutCascader
                      ? () =>
                          definirCascade({
                            cle,
                            typeCibleId,
                            libelleLien: candidat.libelleLu,
                          })
                      : undefined
                  }
                  raisonCreationFermee={
                    peutCascader
                      ? undefined
                      : 'Profondeur maximale atteinte — enregistrer, puis poursuivre depuis la fiche créée.'
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {erreur && (
        <p className={controles.erreur} role="alert">
          {erreur}
        </p>
      )}

      <div className={styles.pied}>
        <CompteurImpact
          impact={{
            entitesCreees: registre.creees.length,
            entitesRestantes: 1,
            liensRestants: nombreDeLiens,
          }}
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => void abandonner()}
          >
            Annuler
          </button>
          <button
            type="button"
            className={controles.bouton}
            onClick={() => definirRecapitulatif(true)}
            disabled={creerEntite.isPending || libelle.length === 0}
          >
            {creerEntite.isPending ? 'Enregistrement…' : 'Créer la fiche'}
          </button>
        </div>
      </div>

      {recapitulatif && (
        <Modale
          titre={`Créer ${type.libelle.toLowerCase()} « ${libelle} » ?`}
          libelleConfirmation="Créer"
          irreversible
          enCours={creerEntite.isPending}
          onAnnuler={() => definirRecapitulatif(false)}
          onConfirmer={() => void enregistrer()}
        >
          <p>
            {nombreDeLiens > 0
              ? `${nombreDeLiens} lien${nombreDeLiens > 1 ? 's' : ''} ${
                  nombreDeLiens > 1 ? 'seront posés' : 'sera posé'
                }, lisible${nombreDeLiens > 1 ? 's' : ''} depuis les deux fiches concernées.`
              : 'Aucun lien ne sera posé.'}
          </p>
          {(doublons.data ?? []).length > 0 && (
            <p>
              {doublons.data!.length} fiche
              {doublons.data!.length > 1 ? 's' : ''} proche
              {doublons.data!.length > 1 ? 's' : ''} a été signalée avant cette
              création.
            </p>
          )}
          <p>Rien n’est jamais supprimé : une fiche créée s’archive.</p>
        </Modale>
      )}

      {cascade && (
        <SousFormulaire
          typeCibleId={cascade.typeCibleId}
          libelleLien={cascade.libelleLien}
          libelleParent={libelle || type.libelle}
          source={source}
          onSourceChange={onSourceChange}
          registre={registre}
          dossierId={dossierId}
          profondeur={profondeur + 1}
          onEnregistre={(entite) => {
            const candidat = candidats.find(
              (element) => cleDe(element.lien, element.sens) === cascade.cle,
            );
            choisir(cascade.cle, entite, candidat?.lien.multiple ?? true);
            definirCascade(null);
          }}
          onAnnule={() => definirCascade(null)}
        />
      )}
    </div>
  );
}

/**
 * Sous-formulaire bloquant.
 *
 * On en sort par validation, qui persiste, ou par annulation explicite, qui
 * retire ce qui vient d'être créé. Rien d'autre ne le referme : ni le voile,
 * ni la touche d'échappement — une fermeture accidentelle laisserait la saisie
 * du parent dans un état que l'agent n'a pas choisi.
 */
function SousFormulaire({
  typeCibleId,
  libelleLien,
  libelleParent,
  source,
  onSourceChange,
  registre,
  dossierId,
  profondeur,
  onEnregistre,
  onAnnule,
}: {
  typeCibleId: string;
  libelleLien: string;
  libelleParent: string;
  source: SourceActive;
  onSourceChange: (source: SourceActive) => void;
  registre: RegistreCascade;
  /** Le dossier de saisie se propage à toute la cascade, comme la source. */
  dossierId?: string;
  profondeur: number;
  onEnregistre: (entite: EntiteEnregistree) => void;
  onAnnule: () => void;
}) {
  const referentiel = useReferentiel();
  const type = referentiel.data?.typesEntites.find(
    (candidat) => candidat.id === typeCibleId,
  );

  return (
    <div className={styles.voileCascade}>
      <div className={styles.boiteCascade} role="dialog" aria-modal="true">
        <header className={styles.enteteCascade}>
          <h2 className={styles.titreCascade}>
            Nouvelle fiche — {type?.libelle ?? '…'}
          </h2>
          <span className={styles.niveauCascade}>niveau {profondeur}</span>
        </header>

        <MoteurFormulaire
          typeEntiteId={typeCibleId}
          source={source}
          onSourceChange={onSourceChange}
          registre={registre}
          dossierId={dossierId}
          profondeur={profondeur}
          heritage={{ libelleLien, libelleParent }}
          onEnregistre={onEnregistre}
          onAnnule={onAnnule}
        />
      </div>
    </div>
  );
}
