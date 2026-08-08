'use client';

import { EtatVide } from '@/composants/etat-vide';
import { EnteteZone } from '@/composants/zone';

export default function PageGraphe() {
  return (
    <>
      <EnteteZone
        titre="Graphe"
        sousTitre="Exploration par expansion, filtre de fiabilité, recherche de chemin — le plus court et le plus solide."
        lot="Lot 9"
      />
      <EtatVide
        titre="Rien à explorer pour le moment."
        explication="Le graphe se construit tout seul à partir des liens saisis : personne ne le dessine à la main."
      />
    </>
  );
}
