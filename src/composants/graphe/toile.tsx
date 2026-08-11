'use client';

import { useEffect, useMemo, useRef } from 'react';

import type { AreteGraphe, NoeudGraphe } from '@/api/graphe';
import { COULEURS_TYPE, COULEUR_TYPE_INCONNU } from './couleurs';
import styles from './graphe.module.css';

/**
 * Toile Sigma.js.
 *
 * Chargée dynamiquement : Sigma touche au DOM et à WebGL dès son import, et
 * n'a rien à faire dans le rendu serveur.
 *
 * **Le filtrage passe par les réducteurs, jamais par le graphe.** Sigma appelle
 * `nodeReducer` et `edgeReducer` à chaque rendu pour décider de l'apparence de
 * chaque élément : masquer revient à renvoyer `hidden: true`, sans toucher à la
 * structure. Retirer puis remettre des nœuds relancerait la disposition et
 * ferait sauter la carte sous les yeux de l'agent — c'est tout l'intérêt.
 *
 * La couleur d'un **nœud** dit son type ; celle d'une **arête** dit la
 * fiabilité du fait. Deux échelles, deux objets : elles ne se disputent pas.
 */

/** Type minimal du module ForceAtlas2, pour ne pas dépendre de ses génériques. */
type ForceAtlas2 = typeof import('graphology-layout-forceatlas2').default;
type GrapheSigma = import('graphology').MultiDirectedGraph;

/**
 * Réglages de ForceAtlas2, en un seul endroit.
 *
 * Desserrés à dessein : sur une carte d'enquête, l'espace entre grappes est ce
 * qui rend les grappes visibles. Un graphe compact est joli et illisible.
 */
function appliquerForce(fa2: ForceAtlas2, graphe: GrapheSigma): void {
  fa2.assign(graphe, {
    iterations: 500,
    settings: {
      ...fa2.inferSettings(graphe),
      gravity: 0.5,
      scalingRatio: 16,
      slowDown: 8,
      // Au-delà du millier de nœuds, l'approximation de Barnes-Hut est la
      // différence entre une seconde et une minute.
      barnesHutOptimize: graphe.order > 300,
    },
  });
}

/**
 * Place en couronne les nœuds dépourvus de position, autour de ce qui existe.
 *
 * Sans cela, ils arriveraient tous à (0,0) et s'empileraient en un point — ce
 * qui se produit dès qu'un seul nœud a été déposé à la main.
 */
function disposerEnCouronne(graphe: GrapheSigma, orphelins: string[]): void {
  const places = graphe
    .nodes()
    .filter((noeud) => !orphelins.includes(noeud))
    .map((noeud) => ({
      x: graphe.getNodeAttribute(noeud, 'x') as number,
      y: graphe.getNodeAttribute(noeud, 'y') as number,
    }));

  const centre = places.length
    ? {
        x: places.reduce((somme, p) => somme + p.x, 0) / places.length,
        y: places.reduce((somme, p) => somme + p.y, 0) / places.length,
      }
    : { x: 0, y: 0 };

  // Un rayon qui englobe le nuage existant : la couronne se pose autour, pas
  // par-dessus.
  const rayon =
    places.reduce(
      (max, p) => Math.max(max, Math.hypot(p.x - centre.x, p.y - centre.y)),
      0,
    ) * 1.25 || 200;

  orphelins.forEach((noeud, rang) => {
    const angle = (Math.PI * 2 * rang) / orphelins.length;
    graphe.setNodeAttribute(noeud, 'x', centre.x + rayon * Math.cos(angle));
    graphe.setNodeAttribute(noeud, 'y', centre.y + rayon * Math.sin(angle));
  });
}

/** Une couleur par niveau de fiabilité, lue dans les jetons du thème. */
function couleursFiabilite(): Record<number, string> {
  const style = getComputedStyle(document.documentElement);
  const jeton = (nom: string) => style.getPropertyValue(nom).trim();

  return {
    4: jeton('--fiabilite-4'),
    3: jeton('--fiabilite-3'),
    2: jeton('--fiabilite-2'),
    1: jeton('--fiabilite-1'),
  };
}

export interface EtatToile {
  /** Nœud mis au point. La caméra s'y recentre quand il change. */
  selection: string | null;
  /**
   * Nœuds à montrer. `null` — aucun filtre, tout est visible.
   *
   * Calculé par la page : le nœud qui répond au filtre, et tout ce qui lui est
   * relié de proche en proche.
   */
  visibles: Set<string> | null;
}

export function Toile({
  noeuds,
  aretes,
  selection,
  visibles,
  surSelection,
  surOuverture,
  surDeplacement,
  signalOrganisation,
  surOrganisation,
}: {
  noeuds: NoeudGraphe[];
  aretes: AreteGraphe[];
  selection: string | null;
  visibles: Set<string> | null;
  /** Clic simple. Chaîne vide lorsque le clic tombe dans le vide. */
  surSelection: (id: string) => void;
  /** Double-clic — ouvre la fiche dans le panneau de droite. */
  surOuverture: (id: string) => void;
  /**
   * Positions à retenir — un nœud après un glissement, tous après une
   * réorganisation.
   *
   * Absent lorsque l'agent n'a pas la permission de repositionner : il peut
   * toujours déplacer et réorganiser pour lire la carte, mais rien n'est
   * enregistré — la disposition est partagée par tout le service.
   */
  surDeplacement?: (
    positions: { entiteId: string; x: number; y: number }[],
  ) => void;
  /**
   * Compteur de demandes de réorganisation.
   *
   * Un compteur plutôt qu'un booléen : réorganiser deux fois de suite est une
   * demande légitime, et un booléen ne saurait pas la distinguer d'un rendu.
   */
  signalOrganisation: number;
  /** Prévient du début et de la fin du calcul, qui bloque le fil principal. */
  surOrganisation?: (enCours: boolean) => void;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const rendu = useRef<{
    sigma: import('sigma').default | null;
    graphe: GrapheSigma | null;
  }>({ sigma: null, graphe: null });

  // Les modules de disposition, gardés après leur import : la réorganisation
  // en a besoin longtemps après la construction de la toile.
  const outils = useRef<{
    fa2: ForceAtlas2;
    circulaire: typeof import('graphology-layout').circular;
    animer: typeof import('sigma/utils').animateNodes;
  } | null>(null);

  // Les réducteurs sont installés une fois pour toutes et lisent cet état à
  // chaque rendu : le changer puis appeler `refresh()` suffit à tout ré-habiller.
  const etat = useRef<EtatToile>({ selection, visibles });
  etat.current = { selection, visibles };

  const rappels = useRef({
    surSelection,
    surOuverture,
    surDeplacement,
    surOrganisation,
  });
  rappels.current = {
    surSelection,
    surOuverture,
    surDeplacement,
    surOrganisation,
  };

  /**
   * Glissement en cours.
   *
   * `aBouge` distingue un clic d'un déplacement : les deux commencent par un
   * `downNode`, et sans ce drapeau tout glissement finirait aussi par recentrer
   * la caméra, ce qui arracherait le nœud des mains de l'agent.
   *
   * `vientDeDeposer` survit au dépôt le temps d'un événement : `upNode` précède
   * `clickNode`, donc remettre `aBouge` à zéro dans le dépôt rendrait la garde
   * du clic inopérante. Le clic le consomme.
   */
  const glissement = useRef<{
    noeud: string | null;
    aBouge: boolean;
    vientDeDeposer: boolean;
  }>({ noeud: null, aBouge: false, vientDeDeposer: false });

  /** Le clic qui suit un dépôt ne doit ni sélectionner ni relâcher. */
  const consommerLeDepot = (): boolean => {
    if (!glissement.current.vientDeDeposer) {
      return false;
    }

    glissement.current.vientDeDeposer = false;
    return true;
  };

  // La structure ne se reconstruit que si la matière change réellement.
  const empreinte = useMemo(
    () => `${noeuds.length}:${aretes.length}:${noeuds[0]?.id ?? ''}`,
    [noeuds, aretes],
  );

  useEffect(() => {
    let vivant = true;

    void (async () => {
      const [
        { default: Sigma },
        { MultiDirectedGraph },
        { default: fa2 },
        layout,
        { animateNodes },
      ] = await Promise.all([
        import('sigma'),
        import('graphology'),
        import('graphology-layout-forceatlas2'),
        import('graphology-layout'),
        import('sigma/utils'),
      ]);

      if (!vivant || !conteneur.current) {
        return;
      }

      outils.current = {
        fa2,
        circulaire: layout.circular,
        animer: animateNodes,
      };

      rendu.current.sigma?.kill();

      const graphe = new MultiDirectedGraph();
      const fiabilites = couleursFiabilite();

      for (const noeud of noeuds) {
        graphe.addNode(noeud.id, {
          label: noeud.libelle,
          typeCode: noeud.typeCode,
          visibilite: noeud.visibilite,
          recurrence: noeud.recurrence,
          couleur: COULEURS_TYPE[noeud.typeCode] ?? COULEUR_TYPE_INCONNU,
          // Positions mémorisées si elles existent ; la disposition s'en
          // chargera sinon.
          x: noeud.x ?? 0,
          y: noeud.y ?? 0,
          size: 7,
        });
      }

      for (const arete of aretes) {
        // Une arête dont une extrémité manque ne peut pas être posée : cela
        // n'arrive que si la vue a été filtrée en amont.
        if (!graphe.hasNode(arete.sujetId) || !graphe.hasNode(arete.cibleId)) {
          continue;
        }

        graphe.addEdgeWithKey(arete.id, arete.sujetId, arete.cibleId, {
          label: arete.libelle,
          fiabilite: arete.fiabilite,
          couleur: fiabilites[arete.fiabilite],
          size: 1.4,
          type: 'arrow',
        });
      }

      // La taille dit le degré : ce qui relie beaucoup se voit de loin.
      graphe.forEachNode((noeud) => {
        const degre = graphe.degree(noeud);
        graphe.setNodeAttribute(noeud, 'size', 6 + Math.min(degre, 14) * 0.85);
      });

      /*
       * Disposition initiale.
       *
       * Trois cas, et le troisième est celui qu'on oublie :
       *
       * - **rien de mémorisé** — on calcule tout ;
       * - **tout est mémorisé** — on ne touche à rien, le service a placé ;
       * - **mélange** — dès qu'un seul nœud a été déposé à la main, les autres
       *   arriveraient tous à (0,0) et s'empileraient en un point. On les
       *   dispose en couronne autour de ce qui existe déjà, sans déplacer ce
       *   que quelqu'un a posé volontairement.
       */
      const sansPosition = noeuds.filter(
        (noeud) => noeud.x === null || noeud.y === null,
      );

      if (sansPosition.length === noeuds.length) {
        // Un cercle d'abord : ForceAtlas2 ne sait rien faire de points
        // confondus, il lui faut des coordonnées de départ distinctes.
        layout.circular.assign(graphe, { scale: 100 });
        appliquerForce(fa2, graphe);
      } else if (sansPosition.length > 0) {
        disposerEnCouronne(
          graphe,
          sansPosition.map((noeud) => noeud.id),
        );
      }

      const style = getComputedStyle(document.documentElement);
      const jeton = (nom: string) => style.getPropertyValue(nom).trim();

      const estompe = jeton('--border');
      const texte = jeton('--text-primary');

      const sigma = new Sigma(graphe, conteneur.current, {
        renderEdgeLabels: true,
        defaultEdgeType: 'arrow',
        labelFont: jeton('--police'),
        labelColor: { color: texte },
        labelSize: 11,
        labelWeight: '500',
        edgeLabelFont: jeton('--police'),
        edgeLabelColor: { color: jeton('--text-muted') },
        edgeLabelSize: 9,
        // Au-delà d'un certain nombre de nœuds à l'écran, Sigma cesse
        // d'afficher les libellés : ce seuil décide de la densité tolérée.
        labelRenderedSizeThreshold: 7,
        labelDensity: 0.5,
        labelGridCellSize: 90,
        zIndex: true,

        /**
         * Habillage d'un nœud à chaque rendu.
         *
         * Trois états : masqué par le filtre, mis en avant parce qu'il est
         * sélectionné ou voisin, estompé sinon.
         */
        nodeReducer: (identifiant, donnees) => {
          const { selection: choisi, visibles: montres } = etat.current;

          const habillage: Record<string, unknown> = {
            ...donnees,
            color: donnees.couleur as string,
          };

          if (montres && !montres.has(identifiant)) {
            habillage.hidden = true;
            return habillage;
          }

          if (!choisi) {
            return habillage;
          }

          const voisin =
            identifiant === choisi ||
            (rendu.current.graphe?.areNeighbors(choisi, identifiant) ?? false);

          if (identifiant === choisi) {
            habillage.highlighted = true;
            habillage.forceLabel = true;
            habillage.zIndex = 2;
            habillage.size = (donnees.size as number) * 1.35;
          } else if (voisin) {
            habillage.forceLabel = true;
            habillage.zIndex = 1;
          } else {
            // La mise au point : ce qui n'est ni sélectionné ni voisin recule.
            habillage.color = estompe;
            habillage.label = '';
            habillage.zIndex = 0;
          }

          return habillage;
        },

        edgeReducer: (identifiant, donnees) => {
          const { selection: choisi, visibles: montres } = etat.current;
          const graphe = rendu.current.graphe;

          const habillage: Record<string, unknown> = {
            ...donnees,
            color: donnees.couleur as string,
          };

          if (!graphe) {
            return habillage;
          }

          const source = graphe.source(identifiant);
          const destination = graphe.target(identifiant);

          if (montres && (!montres.has(source) || !montres.has(destination))) {
            habillage.hidden = true;
            return habillage;
          }

          if (!choisi) {
            habillage.label = '';
            return habillage;
          }

          if (source === choisi || destination === choisi) {
            habillage.size = (donnees.size as number) * 2;
            habillage.zIndex = 1;
          } else {
            habillage.color = estompe;
            habillage.label = '';
            habillage.zIndex = 0;
          }

          return habillage;
        },
      });

      rendu.current = { sigma, graphe };

      // En développement seulement : la toile est rendue en WebGL, donc
      // inspectable par aucun outil du DOM. Sans cette poignée, on ne peut ni
      // vérifier une position de nœud ni rejouer un glissement.
      if (process.env.NODE_ENV !== 'production') {
        (window as unknown as Record<string, unknown>).__toile = {
          sigma,
          graphe,
        };
      }

      sigma.on('clickNode', ({ node }) => {
        // Un glissement se termine par un clic : ne pas le confondre avec une
        // sélection, sous peine de recentrer la caméra sur le nœud qu'on vient
        // tout juste de déposer.
        if (consommerLeDepot()) {
          return;
        }

        rappels.current.surSelection(node);
      });

      sigma.on('clickStage', () => {
        if (consommerLeDepot()) {
          return;
        }

        rappels.current.surSelection('');
      });

      sigma.on('doubleClickNode', (evenement) => {
        // Sans cela, Sigma zoome sur le double-clic en plus d'ouvrir la fiche.
        evenement.preventSigmaDefault();
        rappels.current.surOuverture(evenement.node);
      });

      // ───────────────────── Glisser-déposer ─────────────────────

      sigma.on('downNode', ({ node }) => {
        glissement.current = {
          noeud: node,
          aBouge: false,
          vientDeDeposer: false,
        };

        // Le cadrage se fige le temps du glissement : sans cela, sortir un nœud
        // de l'étendue courante ferait recalculer les bornes et la carte
        // entière glisserait sous le curseur.
        if (!sigma.getCustomBBox()) {
          sigma.setCustomBBox(sigma.getBBox());
        }

        graphe.setNodeAttribute(node, 'highlighted', true);
      });

      sigma.on('moveBody', ({ event }) => {
        const { noeud } = glissement.current;

        if (!noeud) {
          return;
        }

        glissement.current.aBouge = true;

        // Les coordonnées de la souris sont dans le repère de l'écran ; celles
        // du graphe ne le sont pas. La conversion est ce qui fait que le nœud
        // suit le curseur quel que soit le zoom.
        const position = sigma.viewportToGraph(event);

        graphe.setNodeAttribute(noeud, 'x', position.x);
        graphe.setNodeAttribute(noeud, 'y', position.y);

        // Sans cela, la caméra se déplacerait en même temps que le nœud.
        event.preventSigmaDefault();
        event.original.preventDefault();
        event.original.stopPropagation();
      });

      const deposer = (): void => {
        const { noeud, aBouge } = glissement.current;

        if (noeud) {
          graphe.removeNodeAttribute(noeud, 'highlighted');

          if (aBouge) {
            rappels.current.surDeplacement?.([
              {
                entiteId: noeud,
                x: graphe.getNodeAttribute(noeud, 'x') as number,
                y: graphe.getNodeAttribute(noeud, 'y') as number,
              },
            ]);
          }
        }

        glissement.current = {
          noeud: null,
          aBouge: false,
          vientDeDeposer: aBouge,
        };
      };

      sigma.on('upNode', deposer);
      sigma.on('upStage', deposer);

      sigma.getCamera().animatedReset();
    })();

    return () => {
      vivant = false;
      rendu.current.sigma?.kill();
      rendu.current = { sigma: null, graphe: null };
    };
  }, [empreinte, noeuds, aretes]);

  // ───────────────────── Réorganisation ─────────────────────

  useEffect(() => {
    // Le compteur part de zéro : la disposition initiale est déjà faite à la
    // construction, il n'y a rien à rejouer au montage.
    if (signalOrganisation === 0) {
      return;
    }

    const { sigma, graphe } = rendu.current;

    if (!sigma || !graphe || !outils.current) {
      return;
    }

    const { fa2, circulaire, animer } = outils.current;

    rappels.current.surOrganisation?.(true);

    let arreter: (() => void) | null = null;

    // Le calcul bloque le fil principal une fraction de seconde : on laisse le
    // navigateur peindre l'état « en cours » avant de le lui prendre.
    const differe = window.setTimeout(() => {
      // On calcule sur une copie : le graphe affiché ne doit pas sauter d'un
      // coup à l'arrivée, il doit y glisser.
      const cible = graphe.copy() as GrapheSigma;

      circulaire.assign(cible, { scale: 100 });
      appliquerForce(fa2, cible);

      const arrivee: Record<string, { x: number; y: number }> = {};

      cible.forEachNode((noeud, attributs) => {
        arrivee[noeud] = {
          x: attributs.x as number,
          y: attributs.y as number,
        };
      });

      arreter = animer(
        graphe,
        arrivee,
        { duration: 600, easing: 'quadraticInOut' },
        () => {
          sigma.getCamera().animatedReset({ duration: 400 });
          rappels.current.surOrganisation?.(false);

          rappels.current.surDeplacement?.(
            Object.entries(arrivee).map(([entiteId, position]) => ({
              entiteId,
              x: position.x,
              y: position.y,
            })),
          );
        },
      );
    }, 40);

    return () => {
      window.clearTimeout(differe);
      arreter?.();
    };
  }, [signalOrganisation]);

  // ─────────── Mise au point, recentrage et filtre ───────────

  useEffect(() => {
    const { sigma } = rendu.current;

    if (!sigma) {
      return;
    }

    // Les réducteurs lisent `etat.current` : il suffit de redemander un rendu.
    sigma.refresh({ skipIndexation: true });

    if (!selection) {
      return;
    }

    const position = sigma.getNodeDisplayData(selection);

    if (position) {
      // Le recentrage, qui est ce que le clic promet.
      void sigma
        .getCamera()
        .animate(
          { x: position.x, y: position.y, ratio: 0.55 },
          { duration: 420, easing: 'quadraticInOut' },
        );
    }
  }, [selection, visibles]);

  return <div ref={conteneur} className={styles.toile} />;
}
