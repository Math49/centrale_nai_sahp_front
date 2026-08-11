'use client';

import { useEffect, useMemo, useRef } from 'react';

import type { AreteGraphe, NoeudGraphe } from '@/api/graphe';
import { COULEURS_TYPE, COULEUR_TYPE_INCONNU } from './couleurs';
import styles from './graphe.module.css';

type ForceAtlas2 = typeof import('graphology-layout-forceatlas2').default;
type GrapheSigma = import('graphology').MultiDirectedGraph;

function appliquerForce(fa2: ForceAtlas2, graphe: GrapheSigma): void {
  fa2.assign(graphe, {
    iterations: 500,
    settings: {
      ...fa2.inferSettings(graphe),
      gravity: 0.5,
      scalingRatio: 16,
      slowDown: 8,

      barnesHutOptimize: graphe.order > 300,
    },
  });
}

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
  selection: string | null;

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

  surSelection: (id: string) => void;

  surOuverture: (id: string) => void;

  surDeplacement?: (
    positions: { entiteId: string; x: number; y: number }[],
  ) => void;

  signalOrganisation: number;

  surOrganisation?: (enCours: boolean) => void;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const rendu = useRef<{
    sigma: import('sigma').default | null;
    graphe: GrapheSigma | null;
  }>({ sigma: null, graphe: null });

  const outils = useRef<{
    fa2: ForceAtlas2;
    circulaire: typeof import('graphology-layout').circular;
    animer: typeof import('sigma/utils').animateNodes;
  } | null>(null);

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

  const glissement = useRef<{
    noeud: string | null;
    aBouge: boolean;
    vientDeDeposer: boolean;
  }>({ noeud: null, aBouge: false, vientDeDeposer: false });

  const consommerLeDepot = (): boolean => {
    if (!glissement.current.vientDeDeposer) {
      return false;
    }

    glissement.current.vientDeDeposer = false;
    return true;
  };

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

          x: noeud.x ?? 0,
          y: noeud.y ?? 0,
          size: 7,
        });
      }

      for (const arete of aretes) {
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

      graphe.forEachNode((noeud) => {
        const degre = graphe.degree(noeud);
        graphe.setNodeAttribute(noeud, 'size', 6 + Math.min(degre, 14) * 0.85);
      });

      const sansPosition = noeuds.filter(
        (noeud) => noeud.x === null || noeud.y === null,
      );

      if (sansPosition.length === noeuds.length) {
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

        labelRenderedSizeThreshold: 7,
        labelDensity: 0.5,
        labelGridCellSize: 90,
        zIndex: true,

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

      if (process.env.NODE_ENV !== 'production') {
        (window as unknown as Record<string, unknown>).__toile = {
          sigma,
          graphe,
        };
      }

      sigma.on('clickNode', ({ node }) => {
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
        evenement.preventSigmaDefault();
        rappels.current.surOuverture(evenement.node);
      });

      sigma.on('downNode', ({ node }) => {
        glissement.current = {
          noeud: node,
          aBouge: false,
          vientDeDeposer: false,
        };

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

        const position = sigma.viewportToGraph(event);

        graphe.setNodeAttribute(noeud, 'x', position.x);
        graphe.setNodeAttribute(noeud, 'y', position.y);

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

  useEffect(() => {
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

    const differe = window.setTimeout(() => {
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

  useEffect(() => {
    const { sigma } = rendu.current;

    if (!sigma) {
      return;
    }

    sigma.refresh({ skipIndexation: true });

    if (!selection) {
      return;
    }

    const position = sigma.getNodeDisplayData(selection);

    if (position) {
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
