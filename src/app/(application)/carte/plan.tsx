'use client';

import { useMemo, useState } from 'react';

import {
  useCreerRepere,
  usePointsDesDonnees,
  useReperes,
  useTypesReperes,
  type TypeRepere,
} from '@/api/carte';
import { usePermission } from '@/auth/use-permission';
import type { PointPlan } from '@/composants/carte/fond';
import {
  aUneSurface,
  cercleEntre,
  lireGeometrie,
  rectangleEntre,
  ICONES_FORME,
  LIBELLES_FORME,
  type FormeZone,
  type Geometrie,
} from '@/composants/carte/geometrie';
import {
  ToileCarte,
  type MarqueurCarte,
  type ZoneCarte,
} from '@/composants/carte/toile-carte';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { Icone } from '@/composants/icones';
import { EnteteZone } from '@/composants/zone';
import { BarreFiltres, FILTRES_INITIAUX, type Filtres } from './barre-filtres';
import styles from './carte.module.css';
import { FormulaireRepere } from './formulaire-repere';
import { PanneauPoint } from './panneau-point';
import { PanneauRepere } from './panneau-repere';

/** Préfixe des marqueurs venus des fiches — ils ne sont pas des repères. */
const PREFIXE_FICHE = 'donnee:';

/**
 * Ce qu'on est en train de poser.
 *
 * `depart` n'est renseigné que pour une zone, entre le premier et le second
 * clic. Une zone se trace en deux clics : le coin opposé pour un rectangle, un
 * point du bord pour un rond.
 */
interface Trace {
  type: TypeRepere;
  forme: 'point' | FormeZone;
  depart: PointPlan | null;
  survol: PointPlan | null;
}

export function Plan() {
  const [filtres, definirFiltres] = useState<Filtres>(FILTRES_INITIAUX);

  const types = useTypesReperes();
  const reperes = useReperes(filtres.archives);
  const donnees = usePointsDesDonnees();
  const creer = useCreerRepere();

  const peutAnnoter = usePermission('carte.annoter');

  const [choisi, definirChoisi] = useState<string | null>(null);
  const [trace, definirTrace] = useState<Trace | null>(null);
  const [aEnregistrer, definirAEnregistrer] = useState<{
    type: TypeRepere;
    geometrie: Geometrie;
  } | null>(null);

  const listeTypes = useMemo(() => types.data ?? [], [types.data]);

  /*
   * Le filtrage, en un seul endroit.
   *
   * Il ne porte que sur ce que l'agent voit déjà : ce qu'il n'a pas le droit de
   * voir n'est jamais arrivé jusqu'ici, et aucun compteur de cet écran ne le
   * mentionne.
   */
  const listeReperes = useMemo(() => {
    const cherche = filtres.recherche.trim().toLowerCase();

    return (reperes.data ?? []).filter((repere) => {
      if (
        filtres.types.length > 0 &&
        !filtres.types.includes(repere.typeRepereId)
      ) {
        return false;
      }

      if (
        filtres.natures.length > 0 &&
        !filtres.natures.includes(repere.nature)
      ) {
        return false;
      }

      if (
        filtres.visibilites.length > 0 &&
        !filtres.visibilites.includes(repere.visibilite)
      ) {
        return false;
      }

      if (cherche === '') {
        return true;
      }

      return [repere.libelle, repere.note ?? '', repere.typeRepereLibelle]
        .join(' ')
        .toLowerCase()
        .includes(cherche);
    });
  }, [reperes.data, filtres]);

  const listeDonnees = useMemo(() => {
    const cherche = filtres.recherche.trim().toLowerCase();

    return (donnees.data ?? []).filter((point) => {
      // Un point de fiche est toujours un point : filtrer sur « zones » l'écarte.
      if (filtres.natures.length > 0 && !filtres.natures.includes('point')) {
        return false;
      }

      if (
        filtres.types.length > 0 &&
        (!point.typeRepereId || !filtres.types.includes(point.typeRepereId))
      ) {
        return false;
      }

      if (
        filtres.visibilites.length > 0 &&
        !filtres.visibilites.includes(point.visibilite)
      ) {
        return false;
      }

      if (cherche === '') {
        return true;
      }

      return [
        point.entiteLibelle,
        point.champLibelle,
        point.typeRepereLibelle ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(cherche);
    });
  }, [donnees.data, filtres]);

  const marqueurs = useMemo<MarqueurCarte[]>(() => {
    const desReperes = filtres.reperes
      ? listeReperes.flatMap((repere) => {
          const geometrie = lireGeometrie(repere.geometrie);

          if (geometrie?.type !== 'point') {
            return [];
          }

          return [
            {
              id: repere.id,
              point: { x: geometrie.x, y: geometrie.y },
              libelle: repere.libelle,
              couleur: repere.couleur,
              icone: repere.icone,
              opacite: repere.opacite ?? undefined,
              visibilite: repere.visibilite,
            },
          ];
        })
      : [];

    const desDonnees = filtres.donnees
      ? listeDonnees.map((point) => ({
          id: `${PREFIXE_FICHE}${point.entiteId}`,
          point: point.point,
          libelle: `${point.entiteLibelle} — ${point.champLibelle}`,
          couleur: point.couleur,
          icone: point.icone,
          visibilite: point.visibilite,
        }))
      : [];

    return [...desReperes, ...desDonnees];
  }, [listeReperes, listeDonnees, filtres.reperes, filtres.donnees]);

  const zones = useMemo<ZoneCarte[]>(() => {
    if (!filtres.reperes) {
      return [];
    }

    return listeReperes.flatMap((repere) => {
      const forme = lireGeometrie(repere.geometrie);

      if (!forme || forme.type === 'point') {
        return [];
      }

      return [
        {
          id: repere.id,
          forme,
          libelle: repere.libelle,
          couleur: repere.couleur,
          opacite: repere.opacite ?? undefined,
          visibilite: repere.visibilite,
        },
      ];
    });
  }, [listeReperes, filtres.reperes]);

  /** La forme en cours de tracé, telle qu'elle se dessine sous le curseur. */
  const apercu = useMemo<ZoneCarte | null>(() => {
    if (!trace || !trace.depart || !trace.survol || trace.forme === 'point') {
      return null;
    }

    const forme =
      trace.forme === 'rectangle'
        ? rectangleEntre(trace.depart, trace.survol)
        : cercleEntre(trace.depart, trace.survol);

    return {
      id: 'trace',
      forme,
      libelle: 'Tracé en cours',
      couleur: '#9cc2e0',
      opacite: 0.18,
    };
  }, [trace]);

  const repereChoisi = listeReperes.find((repere) => repere.id === choisi);

  const pointChoisi = choisi?.startsWith(PREFIXE_FICHE)
    ? listeDonnees.find(
        (point) => point.entiteId === choisi.slice(PREFIXE_FICHE.length),
      )
    : undefined;

  const surClicPlan = (point: PointPlan) => {
    if (!trace) {
      definirChoisi(null);
      return;
    }

    if (trace.forme === 'point') {
      definirAEnregistrer({
        type: trace.type,
        geometrie: { type: 'point', x: point.x, y: point.y },
      });
      definirTrace(null);
      return;
    }

    if (!trace.depart) {
      definirTrace({ ...trace, depart: point, survol: point });
      return;
    }

    const geometrie =
      trace.forme === 'rectangle'
        ? rectangleEntre(trace.depart, point)
        : cercleEntre(trace.depart, point);

    // Un second clic au même endroit ne dessine rien : on laisse le tracé
    // ouvert plutôt que d'enregistrer une zone d'aire nulle.
    if (!aUneSurface(geometrie)) {
      return;
    }

    definirAEnregistrer({ type: trace.type, geometrie });
    definirTrace(null);
  };

  return (
    <>
      <EnteteZone
        titre="Carte"
        sousTitre="Ce que le service sait du terrain. Un repère classé hors de votre portée n’y figure pas — sur une carte, la position est déjà le renseignement."
      />

      <BarreFiltres
        types={listeTypes}
        filtres={filtres}
        onChange={definirFiltres}
        reperesAffiches={listeReperes.length}
        donneesAffichees={listeDonnees.length}
      />

      {peutAnnoter && (
        <AtelierDePose
          types={listeTypes}
          trace={trace}
          onTrace={(suivant) => {
            definirTrace(suivant);
            definirChoisi(null);
          }}
        />
      )}

      {reperes.isPending ? (
        <p className={controles.remarque}>Chargement de la carte…</p>
      ) : (
        <div className={styles.scene}>
          <ToileCarte
            zoomMolette
            marqueurs={marqueurs}
            zones={zones}
            apercu={apercu}
            selection={choisi}
            // Pendant un tracé, rien de posé n'intercepte : sinon poser un
            // repère à l'intérieur d'une zone existante serait impossible, le
            // clic étant avalé par la zone sans que rien ne l'explique.
            objetsInertes={trace !== null}
            surClicPlan={surClicPlan}
            surSurvolPlan={(point) =>
              definirTrace((courant) =>
                courant?.depart ? { ...courant, survol: point } : courant,
              )
            }
            surClicObjet={definirChoisi}
          />

          {repereChoisi && (
            <PanneauRepere
              repere={repereChoisi}
              surFermeture={() => definirChoisi(null)}
            />
          )}

          {pointChoisi && (
            <PanneauPoint
              point={pointChoisi}
              surFermeture={() => definirChoisi(null)}
            />
          )}
        </div>
      )}

      {listeTypes.length === 0 && (
        <EtatVide
          titre="Aucun type de repère n’est défini."
          explication="Le plan s’affiche, mais rien ne peut encore s’y poser : un repère est toujours d’une sorte connue, et cela se règle en administration."
        />
      )}

      <p className={styles.aide}>
        Clic sur un repère : ouvre son panneau · Trait plein, pointillé ou
        pointillé serré : public, restreint, privé — la couleur, elle, est celle
        qu’on a choisie à la pose · Un repère se retire par archivage, jamais
        par suppression
      </p>

      {aEnregistrer && (
        <FormulaireRepere
          titre={`Poser « ${aEnregistrer.type.libelle} »`}
          type={aEnregistrer.type}
          geometrie={aEnregistrer.geometrie}
          enCours={creer.isPending}
          erreur={creer.isError ? creer.error.message : null}
          onAnnuler={() => definirAEnregistrer(null)}
          onEnregistrer={(valeurs) =>
            creer.mutate(
              {
                typeRepereId: aEnregistrer.type.id,
                // Le contrat décrit la géométrie comme un objet libre : sa
                // forme dépend de la nature du type, connue à l'exécution
                // seule, et c'est l'API qui la valide.
                geometrie: aEnregistrer.geometrie as unknown as Record<
                  string,
                  unknown
                >,
                libelle: valeurs.libelle,
                note: valeurs.note || undefined,
                couleur: valeurs.couleur,
                opacite: valeurs.opacite,
                visibilite:
                  valeurs.visibilite === 'public'
                    ? undefined
                    : valeurs.visibilite,
              },
              { onSuccess: () => definirAEnregistrer(null) },
            )
          }
        />
      )}
    </>
  );
}

/**
 * Poser un repère, indépendamment de toute fiche.
 *
 * **La pose est un mode explicite**, armé ici et désarmé par « Terminer ». Un
 * outil deviné — poser au clic dès qu'on en a la permission — ferait naître des
 * repères par mégarde en cliquant pour lire.
 *
 * Un jeton par **type**, et la forme d'une zone se choisit à part : rectangle
 * ou rond ne sont pas deux sortes de repères, ce sont deux façons de dessiner
 * la même. Les mêler doublait la liste des types pour une différence qui
 * n'appartient pas au catalogue.
 */
function AtelierDePose({
  types,
  trace,
  onTrace,
}: {
  types: TypeRepere[];
  trace: Trace | null;
  onTrace: (trace: Trace | null) => void;
}) {
  const [ouvert, definirOuvert] = useState(false);

  if (types.length === 0) {
    return null;
  }

  if (!ouvert) {
    return (
      <div className={styles.barrePose}>
        <button
          type="button"
          className={controles.bouton}
          onClick={() => definirOuvert(true)}
        >
          <Icone nom="plus" taille={13} /> Poser un repère
        </button>
        <span className={controles.remarque}>
          Autant de repères que nécessaire, sans passer par une fiche.
        </span>
      </div>
    );
  }

  const armer = (type: TypeRepere, forme: 'point' | FormeZone) =>
    onTrace({ type, forme, depart: null, survol: null });

  return (
    <div className={styles.atelier}>
      <div className={styles.ligneAtelier}>
        <span className={styles.titreFiltre}>Ce que je pose</span>

        <div className={styles.jetons}>
          {types.map((type) => (
            <button
              key={type.id}
              type="button"
              className={styles.jeton}
              data-actif={trace?.type.id === type.id}
              onClick={() =>
                armer(
                  type,
                  type.nature === 'point'
                    ? 'point'
                    : // On garde la forme déjà en main d'un type de zone à
                      // l'autre : c'est presque toujours la même qu'on répète.
                      trace && trace.forme !== 'point'
                      ? trace.forme
                      : 'rectangle',
                )
              }
            >
              <IconeFontAwesome valeur={type.icone} taille={12} />
              {type.libelle}
            </button>
          ))}
        </div>

        {trace && trace.type.nature === 'zone' && (
          <div
            className={styles.formes}
            role="group"
            aria-label="Forme de la zone"
          >
            {(['rectangle', 'cercle'] as FormeZone[]).map((forme) => (
              <button
                key={forme}
                type="button"
                className={styles.boutonForme}
                data-actif={trace.forme === forme}
                title={LIBELLES_FORME[forme]}
                aria-label={LIBELLES_FORME[forme]}
                aria-pressed={trace.forme === forme}
                onClick={() => armer(trace.type, forme)}
              >
                <IconeFontAwesome valeur={ICONES_FORME[forme]} taille={13} />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className={controles.boutonDiscret}
          onClick={() => {
            onTrace(null);
            definirOuvert(false);
          }}
        >
          Terminer
        </button>
      </div>

      {trace && (
        <p className={styles.consigne}>
          {trace.forme === 'point'
            ? `Cliquez sur le plan pour poser « ${trace.type.libelle} ».`
            : trace.depart
              ? trace.forme === 'rectangle'
                ? 'Second clic : le coin opposé.'
                : 'Second clic : un point du bord — le rayon suit.'
              : trace.forme === 'rectangle'
                ? 'Premier clic : un coin du rectangle.'
                : 'Premier clic : le centre du rond.'}{' '}
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => onTrace(null)}
          >
            Abandonner
          </button>
        </p>
      )}
    </div>
  );
}
