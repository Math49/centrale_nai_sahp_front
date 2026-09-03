'use client';

import { useState } from 'react';

import {
  useCreerTypeRepere,
  useModifierTypeRepere,
  useOrdonnerTypesReperes,
  useSupprimerTypeRepere,
  useTypesReperes,
  type NatureRepere,
  type TypeRepere,
} from '@/api/carte';
import { GardeSuperAdmin } from '@/auth/garde-super-admin';
import { ChampTexte } from '@/composants/champ-texte';
import { ChoixIcone } from '@/composants/choix-icone';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { ListeReordonnable } from '@/composants/liste-reordonnable';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';
import propres from './types-reperes.module.css';

const VIERGE = {
  code: '',
  libelle: '',
  nature: 'point' as NatureRepere,
  icone: 'fas:location-dot',
};

const LIBELLES_NATURE: Record<NatureRepere, string> = {
  point: 'Point',
  zone: 'Zone',
};

export default function PageTypesReperes() {
  return (
    <GardeSuperAdmin>
      <Atelier />
    </GardeSuperAdmin>
  );
}

function Atelier() {
  const types = useTypesReperes();
  const creer = useCreerTypeRepere();
  const modifier = useModifierTypeRepere();
  const supprimer = useSupprimerTypeRepere();
  const ordonner = useOrdonnerTypesReperes();

  const [nouveau, definirNouveau] = useState(VIERGE);
  const [aRetirer, definirARetirer] = useState<TypeRepere | null>(null);

  const liste = types.data ?? [];

  return (
    <>
      <EnteteZone
        titre="Types de repères"
        sousTitre="Ce que la centrale sait poser sur le plan : QG, laboratoires, braquages, secteurs surveillés. Le type porte l’icône ; la couleur, elle, se choisit à la pose, sur chaque repère."
      />

      <div className={styles.colonne}>
        <div className={styles.panneau}>
          <p className={styles.section}>Types définis</p>

          {liste.length === 0 ? (
            <EtatVide
              titre="Aucun type de repère."
              explication="Sans type, la carte ne sait rien recevoir : un repère est toujours d’une sorte connue."
            />
          ) : (
            <ListeReordonnable
              elements={liste}
              onOrdonner={(ids) => ordonner.mutate(ids)}
              desactive={ordonner.isPending}
              rendu={(type) => (
                <>
                  <span className={styles.entreeListe}>
                    <span className={propres.pastille}>
                      <IconeFontAwesome valeur={type.icone} taille={12} />
                    </span>
                    <span className={styles.entreeLibelle}>{type.libelle}</span>
                    <span className={`${styles.entreeDetail} mono`}>
                      {type.code}
                    </span>
                  </span>

                  <span className={styles.actionsLigne}>
                    <span className={styles.marqueur}>
                      {LIBELLES_NATURE[type.nature]}
                    </span>
                    <Reglages type={type} onModifier={modifier.mutate} />
                    <button
                      type="button"
                      className={styles.retirer}
                      onClick={() => definirARetirer(type)}
                    >
                      Retirer
                    </button>
                  </span>
                </>
              )}
            />
          )}
        </div>

        <form
          className={styles.panneau}
          onSubmit={(evenement) => {
            evenement.preventDefault();
            creer.mutate(nouveau, { onSuccess: () => definirNouveau(VIERGE) });
          }}
        >
          <p className={styles.section}>Nouveau type</p>

          <div className={styles.grilleChamps}>
            <ChampTexte
              etiquette="Code"
              mono
              valeur={nouveau.code}
              onChange={(code) => definirNouveau({ ...nouveau, code })}
              indication="labo, qg, braquage…"
            />
            <ChampTexte
              etiquette="Libellé"
              valeur={nouveau.libelle}
              onChange={(libelle) => definirNouveau({ ...nouveau, libelle })}
            />

            <label className={controles.groupe}>
              <span className={controles.etiquette}>Nature</span>
              <select
                className={controles.champ}
                value={nouveau.nature}
                onChange={(evenement) =>
                  definirNouveau({
                    ...nouveau,
                    nature: evenement.target.value as NatureRepere,
                  })
                }
              >
                <option value="point">Point</option>
                <option value="zone">Zone</option>
              </select>
            </label>
          </div>

          <div className={styles.grilleChamps}>
            <ChoixIcone
              etiquette="Icône"
              valeur={nouveau.icone}
              onChange={(icone) => definirNouveau({ ...nouveau, icone })}
            />
          </div>

          <p className={controles.remarque}>
            La nature est <strong>définitive</strong> : un type de point ne
            devient pas un type de zone, les repères déjà posés en dépendent.
            Une zone se trace ensuite en rectangle ou en rond, au choix.
          </p>

          {creer.isError && (
            <p className={controles.erreur} role="alert">
              {creer.error.message}
            </p>
          )}

          <button
            type="submit"
            className={controles.bouton}
            disabled={creer.isPending}
          >
            {creer.isPending ? 'Création…' : 'Créer le type'}
          </button>
        </form>
      </div>

      {aRetirer && (
        <Modale
          titre={`Retirer « ${aRetirer.libelle} » ?`}
          irreversible
          enCours={supprimer.isPending}
          libelleConfirmation="Retirer"
          onAnnuler={() => definirARetirer(null)}
          onConfirmer={() =>
            supprimer.mutate(aRetirer.id, {
              onSuccess: () => definirARetirer(null),
            })
          }
        >
          <p>
            Le type disparaît du catalogue. Le retrait est refusé dès qu’un
            repère l’utilise — les repères, eux, s’archivent.
          </p>
          {supprimer.isError && (
            <p className={controles.erreur}>{supprimer.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}

/** Réglages d'un type : libellé et icône. Ni la nature, ni la couleur. */
function Reglages({
  type,
  onModifier,
}: {
  type: TypeRepere;
  onModifier: (donnees: {
    id: string;
    libelle?: string;
    icone?: string;
  }) => void;
}) {
  const [ouvert, definirOuvert] = useState(false);
  const [brouillon, definirBrouillon] = useState({
    libelle: type.libelle,
    icone: type.icone,
  });

  return (
    <>
      <button
        type="button"
        className={styles.retirer}
        onClick={() => {
          definirBrouillon({ libelle: type.libelle, icone: type.icone });
          definirOuvert(true);
        }}
      >
        Modifier
      </button>

      {ouvert && (
        <Modale
          titre={`Modifier « ${type.libelle} »`}
          libelleConfirmation="Enregistrer"
          onAnnuler={() => definirOuvert(false)}
          onConfirmer={() => {
            onModifier({ id: type.id, ...brouillon });
            definirOuvert(false);
          }}
        >
          <ChampTexte
            etiquette="Libellé"
            valeur={brouillon.libelle}
            onChange={(libelle) => definirBrouillon({ ...brouillon, libelle })}
          />
          <ChoixIcone
            etiquette="Icône"
            valeur={brouillon.icone}
            onChange={(icone) => definirBrouillon({ ...brouillon, icone })}
          />
          <p className={controles.remarque}>
            Le code et la nature ne se modifient pas : des repères s’y adossent.
            La couleur ne se règle pas ici — elle appartient à chaque repère.
          </p>
        </Modale>
      )}
    </>
  );
}
