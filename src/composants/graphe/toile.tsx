'use client';

import type { Core, ElementDefinition } from 'cytoscape';
import { useEffect, useRef } from 'react';

import type { AreteGraphe, NoeudGraphe } from '@/api/graphe';
import styles from './graphe.module.css';

/**
 * Toile Cytoscape.
 *
 * Chargée dynamiquement : la bibliothèque touche au DOM dès son import et n'a
 * rien à faire dans le rendu serveur.
 *
 * Les couleurs d'arêtes suivent la fiabilité — c'est l'une des deux seules
 * informations auxquelles la couleur est réservée. La légende reste permanente
 * à côté, parce qu'une couleur seule ne se lit pas.
 */
export function Toile({
  noeuds,
  aretes,
  centre,
  surSelection,
  surExpansion,
  surDeplacement,
}: {
  noeuds: NoeudGraphe[];
  aretes: AreteGraphe[];
  centre: string | null;
  surSelection: (id: string) => void;
  surExpansion: (id: string) => void;
  surDeplacement?: (
    positions: { entiteId: string; x: number; y: number }[],
  ) => void;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const noyau = useRef<Core | null>(null);

  // Les rappels changent à chaque rendu ; les garder dans une référence évite
  // de reconstruire la toile pour autant.
  const rappels = useRef({ surSelection, surExpansion, surDeplacement });
  rappels.current = { surSelection, surExpansion, surDeplacement };

  useEffect(() => {
    let vivant = true;

    void import('cytoscape').then(({ default: cytoscape }) => {
      if (!vivant || !conteneur.current || noyau.current) {
        return;
      }

      const style = getComputedStyle(document.documentElement);
      const jeton = (nom: string) => style.getPropertyValue(nom).trim();

      noyau.current = cytoscape({
        container: conteneur.current,
        wheelSensitivity: 0.2,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': jeton('--surface-haute'),
              'border-width': 1,
              'border-color': jeton('--bordure-forte'),
              label: 'data(libelle)',
              color: jeton('--texte'),
              'font-size': 11,
              'text-valign': 'bottom',
              'text-margin-y': 6,
              width: 26,
              height: 26,
            },
          },
          {
            selector: 'node[?centre]',
            style: {
              'border-color': jeton('--accent'),
              'border-width': 2,
              'background-color': jeton('--accent-fond'),
            },
          },
          {
            // Une entité qui relie plusieurs dossiers : le signal apparaît là
            // où l'agent regarde déjà, pas dans un écran séparé.
            selector: 'node[?recurrence]',
            style: {
              'border-color': jeton('--accent-vif'),
              'border-width': 3,
              'border-style': 'double',
            },
          },
          {
            selector: 'node[?masquePartiel]',
            style: { 'background-color': jeton('--surface-survol') },
          },
          {
            selector: 'edge',
            style: {
              width: 1.5,
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle',
              'arrow-scale': 0.7,
              label: 'data(libelle)',
              'font-size': 9,
              color: jeton('--texte-faible'),
              'text-rotation': 'autorotate',
              'text-background-color': jeton('--fond'),
              'text-background-opacity': 0.85,
              'text-background-padding': '2',
            },
          },
          ...[4, 3, 2, 1].map((niveau) => ({
            selector: `edge[fiabilite = ${niveau}]`,
            style: {
              'line-color': jeton(`--fiabilite-${niveau}`),
              'target-arrow-color': jeton(`--fiabilite-${niveau}`),
            },
          })),
        ],
      });

      noyau.current.on('tap', 'node', (evenement) => {
        const id = evenement.target.id() as string;

        if (evenement.originalEvent.shiftKey) {
          rappels.current.surExpansion(id);
        } else {
          rappels.current.surSelection(id);
        }
      });

      noyau.current.on('dragfree', 'node', () => {
        const positions = noyau.current!.nodes().map((noeud) => ({
          entiteId: noeud.id(),
          x: noeud.position('x'),
          y: noeud.position('y'),
        }));

        rappels.current.surDeplacement?.(positions);
      });
    });

    return () => {
      vivant = false;
      noyau.current?.destroy();
      noyau.current = null;
    };
  }, []);

  useEffect(() => {
    const cy = noyau.current;

    if (!cy) {
      return;
    }

    const elements: ElementDefinition[] = [
      ...noeuds.map((noeud) => ({
        data: {
          id: noeud.id,
          libelle:
            noeud.voisinsNonAffiches > 0
              ? `${noeud.libelle} (+${noeud.voisinsNonAffiches})`
              : noeud.libelle,
          recurrence: noeud.recurrence || undefined,
          masquePartiel: noeud.voisinsNonAffiches > 0 || undefined,
          centre: noeud.id === centre || undefined,
        },
        position:
          noeud.x !== null && noeud.y !== null
            ? { x: noeud.x, y: noeud.y }
            : undefined,
      })),
      ...aretes.map((arete) => ({
        data: {
          id: arete.id,
          source: arete.sujetId,
          target: arete.cibleId,
          libelle: arete.libelle,
          fiabilite: arete.fiabilite,
        },
      })),
    ];

    cy.elements().remove();
    cy.add(elements);

    // Disposition automatique pour les nouveaux nœuds ; ceux qui portent une
    // position mémorisée la gardent.
    const sansPosition = cy.nodes().filter((noeud) => {
      const position = noeud.position();
      return position.x === 0 && position.y === 0;
    });

    if (sansPosition.length > 0) {
      cy.layout({ name: 'cose', animate: false, fit: true }).run();
    } else {
      cy.fit(undefined, 40);
    }
  }, [noeuds, aretes, centre]);

  return <div ref={conteneur} className={styles.toile} />;
}
