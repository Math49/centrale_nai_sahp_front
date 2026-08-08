'use client';

import { EtatVide } from '@/composants/etat-vide';
import { EnteteZone } from '@/composants/zone';

export default function PageEntites() {
  return (
    <>
      <EnteteZone
        titre="Entités"
        sousTitre="Groupes, personnes, véhicules, lieux, événements. Les types et leurs champs se configurent en administration."
        lot="Lots 4, 6 et 7"
      />
      <EtatVide
        titre="Aucune entité."
        explication="L'annuaire se remplira dès que les types d'entités seront configurés et que les premières fiches seront saisies."
      />
    </>
  );
}
