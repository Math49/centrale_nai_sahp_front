'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { classesFontAwesome } from '../icone-fontawesome';
import styles from './carte.module.css';
import {
  BORNES,
  ETENDUE,
  FOND,
  versPlan,
  versToile,
  type PointPlan,
} from './fond';
import type { Geometrie } from './geometrie';

type Niveau = 'public' | 'restreint' | 'prive';

export interface MarqueurCarte {
  id: string;
  point: PointPlan;
  libelle: string;
  /** Choisie à la pose : le type de repère n'en porte pas. */
  couleur: string;
  /** Valeur FontAwesome canonique, `fas:house` par exemple. */
  icone?: string | null;
  opacite?: number;
  visibilite?: Niveau;
}

export interface ZoneCarte {
  id: string;
  /** Un rectangle ou un rond. Le polygone libre n'existe plus. */
  forme: Geometrie;
  libelle: string;
  couleur: string;
  opacite?: number;
  visibilite?: Niveau;
}

/**
 * Le plan de la centrale.
 *
 * Leaflet en `CRS.Simple` : le fond n'est pas géographique, c'est une image, et
 * ce repère est fait pour ça. Les tuiles sont en numérotation XYZ — engendrées
 * avec `gdal2tiles -l` — donc consommables telles quelles, sans inversion
 * d'axe.
 *
 * Le montage suit celui de la toile du graphe : `import()` dans l'effet, drapeau
 * `vivant` contre le double montage de StrictMode, instance dans une ref,
 * destruction explicite au démontage.
 *
 * **Aucune icône par défaut de Leaflet n'est utilisée.** Les marqueurs sont des
 * `divIcon` portant une icône FontAwesome : cela évite du même coup le grief
 * classique des images de marqueur que les empaqueteurs ne résolvent pas.
 */
export function ToileCarte({
  marqueurs = [],
  zones = [],
  centreSur,
  selection = null,
  interactif = true,
  zoomMolette = false,
  hauteur,
  apercu = null,
  objetsInertes = false,
  surClicPlan,
  surSurvolPlan,
  surClicObjet,
}: {
  marqueurs?: MarqueurCarte[];
  zones?: ZoneCarte[];
  /** Cadre la vue sur ces points à l'ouverture. Vide : le plan entier. */
  centreSur?: PointPlan[];
  selection?: string | null;
  /** Faux pour une vignette : ni déplacement, ni zoom, ni clic. */
  interactif?: boolean;
  /**
   * La molette zoome-t-elle ?
   *
   * Fermé par défaut, et c'est délibéré : une carte posée dans une page qui
   * défile capture la molette et bloque la lecture — l'agent croit la page
   * gelée. On ne l'ouvre que là où la carte occupe l'écran. Les boutons `+` et
   * `−` restent, eux, toujours disponibles.
   */
  zoomMolette?: boolean;
  hauteur?: string;
  /**
   * La forme en cours de tracé.
   *
   * Sur sa propre couche : elle change à chaque mouvement de souris, et la
   * mêler aux repères ferait reconstruire des centaines de marqueurs par
   * seconde pour un rectangle qui grandit.
   */
  apercu?: ZoneCarte | null;
  /**
   * Les objets posés laissent-ils passer les clics ?
   *
   * Vrai pendant un tracé, et c'est indispensable : une zone couvre une part du
   * plan, et Leaflet lui donne le clic avant la carte. Sans cela, poser un
   * repère à l'intérieur d'une zone existante est simplement impossible — le
   * clic est avalé, rien ne se passe, et rien ne l'explique.
   */
  objetsInertes?: boolean;
  /** Clic sur le fond, en coordonnées normalisées. */
  surClicPlan?: (point: PointPlan) => void;
  /** Survol du fond — ne sert qu'au tracé en cours. */
  surSurvolPlan?: (point: PointPlan) => void;
  surClicObjet?: (id: string) => void;
}) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<import('leaflet').Map | null>(null);
  const couche = useRef<import('leaflet').LayerGroup | null>(null);
  const coucheApercu = useRef<import('leaflet').LayerGroup | null>(null);
  const leaflet = useRef<typeof import('leaflet') | null>(null);

  /**
   * La carte est-elle construite ?
   *
   * Leaflet arrive par un `import()` : au premier rendu, les effets qui posent
   * les couches et cadrent la vue trouvent une carte encore nulle, et leurs
   * dépendances ne bougeant plus jamais, ils ne se rejoueraient pas. Cet état
   * est ce qui les réveille — sans lui, une carte montée avec ses marqueurs
   * s'affiche vide, et rien ne le signale.
   */
  const [prete, definirPrete] = useState(false);

  // Réassignés à chaque rendu, hors effet : les gestionnaires posés une seule
  // fois lisent ainsi des props fraîches sans qu'on remonte la carte.
  const rappels = useRef({ surClicPlan, surSurvolPlan, surClicObjet });
  rappels.current = { surClicPlan, surSurvolPlan, surClicObjet };

  // ───────────────────────── Montage ─────────────────────────

  useEffect(() => {
    let vivant = true;

    void (async () => {
      const L = await import('leaflet');

      if (!vivant || !conteneur.current || carte.current) {
        return;
      }

      leaflet.current = L;

      const instance = L.map(conteneur.current, {
        crs: L.CRS.Simple,
        minZoom: FOND.zoomMin,
        maxZoom: FOND.zoomMax,
        zoomControl: interactif,
        dragging: interactif,
        scrollWheelZoom: interactif && zoomMolette,
        doubleClickZoom: interactif,
        boxZoom: interactif,
        keyboard: interactif,
        touchZoom: interactif,
        attributionControl: false,
      });

      // Leaflet accepte un tableau brut, mais le reconvertit alors pour
      // *chaque* tuile qu'il teste. Sur une pyramide de 5 460, autant le faire
      // une fois.
      const bornes = L.latLngBounds(BORNES);

      L.tileLayer(FOND.tuiles, {
        tileSize: FOND.tailleTuile,
        minZoom: FOND.zoomMin,
        maxZoom: FOND.zoomMax,
        // Au-delà, le navigateur agrandit la dernière tuile transportée.
        maxNativeZoom: FOND.zoomNatif,
        noWrap: true,
        bounds: bornes,
      }).addTo(instance);

      instance.setMaxBounds(bornes);
      instance.fitBounds(bornes);

      couche.current = L.layerGroup().addTo(instance);
      coucheApercu.current = L.layerGroup().addTo(instance);

      instance.on('click', (evenement) => {
        const point = versPlan(evenement.latlng.lat, evenement.latlng.lng);
        rappels.current.surClicPlan?.(point);
      });

      // Toujours branché, jamais coûteux : le parent n'écoute que pendant un
      // tracé. Le brancher à la demande remonterait la carte à chaque bascule.
      instance.on('mousemove', (evenement) => {
        rappels.current.surSurvolPlan?.(
          versPlan(evenement.latlng.lat, evenement.latlng.lng),
        );
      });

      carte.current = instance;
      definirPrete(true);

      // Même raison que `window.__toile` pour le graphe : sans poignée, aucun
      // outil du DOM ne peut vérifier un niveau de zoom ni une position
      // projetée. Un *tableau* et non une variable : une page porte volontiers
      // une carte et sa vignette, et une poignée unique désignerait la dernière
      // montée — de quoi mesurer la mauvaise et croire à un défaut.
      if (process.env.NODE_ENV === 'development') {
        const fenetre = window as unknown as { __cartes?: unknown[] };
        fenetre.__cartes = [...(fenetre.__cartes ?? []), instance];
      }

      // Le conteneur est souvent mesuré avant d'avoir sa taille définitive :
      // sans ce recalcul, Leaflet cadre sur une boîte vide et ne charge que la
      // moitié des tuiles.
      window.setTimeout(() => instance.invalidateSize(), 0);
    })();

    return () => {
      vivant = false;

      const partante = carte.current;

      partante?.remove();
      carte.current = null;
      couche.current = null;
      coucheApercu.current = null;
      definirPrete(false);

      if (process.env.NODE_ENV === 'development' && partante) {
        const fenetre = window as unknown as { __cartes?: unknown[] };
        fenetre.__cartes = (fenetre.__cartes ?? []).filter(
          (candidate) => candidate !== partante,
        );
      }
    };
    // `interactif` fige des options de construction : le changer remonte la
    // carte, ce qui est voulu et ne se produit jamais en pratique.
  }, [interactif, zoomMolette]);

  // ──────────────────── Marqueurs et zones ────────────────────

  /*
   * Les tableaux de props changent d'identité à chaque rendu du parent, même
   * quand leur contenu est le même. Sans empreinte, l'effet vide et reconstruit
   * toutes les couches à chaque frappe dans un champ voisin — sur la carte du
   * service, c'est des centaines de marqueurs redessinés pour rien.
   *
   * Même motif que l'`empreinte` de la toile du graphe.
   */
  const empreinteCouches = useMemo(
    () => JSON.stringify({ marqueurs, zones }),
    [marqueurs, zones],
  );

  const empreinteCadrage = useMemo(
    () => JSON.stringify(centreSur ?? null),
    [centreSur],
  );

  useEffect(() => {
    const L = leaflet.current;
    const groupe = couche.current;

    if (!L || !groupe) {
      return;
    }

    groupe.clearLayers();

    for (const zone of zones) {
      const trace = tracerZone(L, zone, zone.id === selection, objetsInertes);

      if (!trace) {
        continue;
      }

      if (!objetsInertes) {
        trace.on('click', (evenement) => {
          L.DomEvent.stopPropagation(evenement);
          rappels.current.surClicObjet?.(zone.id);
        });

        trace.bindTooltip(zone.libelle, { direction: 'top' });
      }

      trace.addTo(groupe);
    }

    for (const marqueur of marqueurs) {
      const point = L.marker(versToile(marqueur.point), {
        icon: L.divIcon({
          className: '',
          html: htmlDuMarqueur(marqueur, marqueur.id === selection),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
        opacity: marqueur.opacite ?? 1,
        interactive: !objetsInertes,
        keyboard: false,
      });

      if (!objetsInertes) {
        point.on('click', (evenement) => {
          L.DomEvent.stopPropagation(evenement);
          rappels.current.surClicObjet?.(marqueur.id);
        });

        point.bindTooltip(marqueur.libelle, {
          direction: 'top',
          offset: [0, -12],
        });
      }

      point.addTo(groupe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prete, empreinteCouches, selection, objetsInertes]);

  // ───────────────────── Tracé en cours ────────────────────

  const empreinteApercu = useMemo(() => JSON.stringify(apercu), [apercu]);

  useEffect(() => {
    const L = leaflet.current;
    const groupe = coucheApercu.current;

    if (!L || !groupe) {
      return;
    }

    groupe.clearLayers();

    if (!apercu) {
      return;
    }

    // Pointillé, et sans infobulle : ce n'est pas encore un repère, et rien ne
    // doit laisser croire qu'il est posé tant qu'il n'est pas enregistré.
    // Inerte : le tracé grandit sous le curseur, il ne doit pas se mettre à
    // avaler le clic qui doit le refermer.
    const trace = tracerZone(L, apercu, false, true);

    if (trace) {
      trace.setStyle({ dashArray: '6 6' });
      trace.addTo(groupe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prete, empreinteApercu]);

  // ─────────────────────── Cadrage ───────────────────────

  useEffect(() => {
    const L = leaflet.current;
    const instance = carte.current;

    if (!L || !instance || !centreSur || centreSur.length === 0) {
      return;
    }

    if (centreSur.length === 1) {
      instance.setView(versToile(centreSur[0]), FOND.zoomNatif - 1, {
        animate: false,
      });
      return;
    }

    instance.fitBounds(L.latLngBounds(centreSur.map(versToile)).pad(0.35), {
      animate: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prete, empreinteCadrage]);

  return (
    <div
      ref={conteneur}
      className={styles.toile}
      style={hauteur ? { height: hauteur } : undefined}
      data-interactif={interactif}
    />
  );
}

/**
 * Une zone, rectangle ou rond.
 *
 * Un seul endroit convertit une géométrie en couche Leaflet : la carte et
 * l'aperçu du tracé s'en servent tous les deux, et deux rendus divergeraient au
 * premier réglage.
 */
function tracerZone(
  L: typeof import('leaflet'),
  zone: ZoneCarte,
  choisie: boolean,
  inerte = false,
): import('leaflet').Path | null {
  const style = {
    color: zone.couleur,
    weight: choisie ? 3 : 2,
    opacity: 0.9,
    fillColor: zone.couleur,
    fillOpacity: zone.opacite ?? 0.25,
    dashArray: tiretsDeVisibilite(zone.visibilite),
    interactive: !inerte,
  };

  if (zone.forme.type === 'rectangle') {
    return L.rectangle(
      L.latLngBounds(versToile(zone.forme.a), versToile(zone.forme.b)),
      style,
    );
  }

  if (zone.forme.type === 'cercle') {
    // `CRS.Simple` mesure les distances en unités de carte : le rayon
    // normalisé se convertit comme une coordonnée, par l'étendue du plan.
    return L.circle(versToile(zone.forme.centre), {
      ...style,
      radius: zone.forme.rayon * ETENDUE,
    });
  }

  return null;
}

/**
 * La visibilité se lit au trait, jamais à la couleur.
 *
 * La couleur d'un repère est celle qu'on lui a choisie à la pose — entorse
 * assumée et bornée, comme celle du graphe. La visibilité garde donc son propre canal : trait plein
 * pour public, pointillé pour restreint, pointillé serré pour privé. Et elle
 * s'écrit en toutes lettres dans le panneau, jamais seulement ici.
 */
function tiretsDeVisibilite(niveau?: Niveau): string | undefined {
  if (niveau === 'restreint') {
    return '8 5';
  }

  if (niveau === 'prive') {
    return '3 4';
  }

  return undefined;
}

function htmlDuMarqueur(marqueur: MarqueurCarte, choisi: boolean): string {
  const classes = classesFontAwesome(marqueur.icone);

  const pastille = [
    `background:${marqueur.couleur}`,
    choisi ? 'box-shadow:0 0 0 3px rgba(255,255,255,.55)' : '',
  ]
    .filter(Boolean)
    .join(';');

  const icone = classes ? `<i class="${classes}" aria-hidden="true"></i>` : '';

  return `<span class="${styles.marqueur}" style="${pastille}">${icone}</span>`;
}
