'use client';

import { EtatVide } from '@/composants/etat-vide';
import { EnteteZone } from '@/composants/zone';

export default function PageDossiers() {
  return (
    <>
      <EnteteZone
        titre="Dossiers"
        sousTitre="Un dossier est un périmètre d'enquête ancré sur une entité pivot. Il ne contient rien : il contextualise."
        lot="Lot 8"
      />
      <EtatVide
        titre="Aucun dossier."
        explication="Ouvrir un dossier revient à ouvrir la fiche de son entité pivot, avec le panneau de dossier en plus."
      />
    </>
  );
}
