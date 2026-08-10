import type { AreteGraphe, NoeudGraphe } from '@/api/graphe';

/**
 * Voisinage de chaque nœud, dans les deux sens.
 *
 * La propagation ignore la direction : un fait relie deux données, et suivre le
 * fil ne dépend pas de laquelle est sujet. « Isadora possède 8KLM204 » se
 * remonte aussi bien du véhicule vers la personne.
 */
export function adjacence(aretes: AreteGraphe[]): Map<string, string[]> {
  const voisins = new Map<string, string[]>();

  const relier = (de: string, vers: string): void => {
    const deja = voisins.get(de);

    if (deja) {
      deja.push(vers);
    } else {
      voisins.set(de, [vers]);
    }
  };

  for (const arete of aretes) {
    relier(arete.sujetId, arete.cibleId);
    relier(arete.cibleId, arete.sujetId);
  }

  return voisins;
}

/**
 * Tout ce qui se rattache aux données de départ, de proche en proche.
 *
 * Le filtre par nom ne montre pas seulement la donnée trouvée : il montre ses
 * relations, puis les relations de celles-ci, jusqu'au bout du fil. C'est ce
 * qu'un enquêteur cherche en tapant un nom — pas une fiche, une ramification.
 *
 * Parcours en largeur avec marquage à l'entrée : un graphe d'enquête est plein
 * de cycles, et sans cela on tournerait indéfiniment.
 */
export function ramification(
  depart: readonly string[],
  voisins: Map<string, string[]>,
): Set<string> {
  const atteints = new Set<string>(depart);
  const aVoir = [...depart];

  while (aVoir.length > 0) {
    const courant = aVoir.pop()!;

    for (const voisin of voisins.get(courant) ?? []) {
      if (!atteints.has(voisin)) {
        atteints.add(voisin);
        aVoir.push(voisin);
      }
    }
  }

  return atteints;
}

/**
 * Les données à montrer pour un filtre de nom donné.
 *
 * `null` signifie « aucun filtre » — tout est visible. Un ensemble vide
 * signifie « rien ne porte ce nom », ce qui n'est pas la même chose et
 * s'affiche différemment.
 */
export function donneesVisibles(
  filtre: string,
  noeuds: readonly NoeudGraphe[],
  aretes: readonly AreteGraphe[],
): Set<string> | null {
  const cherche = filtre.trim().toLowerCase();

  // Sous deux caractères, le filtre retiendrait presque tout : autant ne rien
  // filtrer, et le dire en n'affichant aucun décompte de filtrage.
  if (cherche.length < 2) {
    return null;
  }

  const trouves = noeuds
    .filter((noeud) => noeud.libelle.toLowerCase().includes(cherche))
    .map((noeud) => noeud.id);

  if (trouves.length === 0) {
    return new Set<string>();
  }

  return ramification(trouves, adjacence([...aretes]));
}
