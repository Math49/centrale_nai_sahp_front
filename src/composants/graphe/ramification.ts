import type { AreteGraphe, NoeudGraphe } from '@/api/graphe';

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

export function donneesVisibles(
  filtre: string,
  noeuds: readonly NoeudGraphe[],
  aretes: readonly AreteGraphe[],
): Set<string> | null {
  const cherche = filtre.trim().toLowerCase();

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
