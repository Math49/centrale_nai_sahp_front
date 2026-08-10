'use client';

import { useState } from 'react';

import {
  useCreerTypeEntite,
  useOrdonnerTypesEntites,
  useReferentiel,
} from '@/api/referentiel';
import { GardeSuperAdmin } from '@/auth/garde-super-admin';
import { ChoixIcone } from '@/composants/choix-icone';
import { ChampTexte } from '@/composants/champ-texte';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { ListeReordonnable } from '@/composants/liste-reordonnable';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';
import { PanneauType } from './panneau-type';

export default function PageTypesEntites() {
  return (
    <GardeSuperAdmin>
      <Atelier />
    </GardeSuperAdmin>
  );
}

function Atelier() {
  const referentiel = useReferentiel();
  const creer = useCreerTypeEntite();
  const ordonner = useOrdonnerTypesEntites();

  const [choisi, definirChoisi] = useState<string | null>(null);
  const [nouveau, definirNouveau] = useState({
    code: '',
    libelle: '',
    libellePluriel: '',
    icone: '',
    modeleLibelle: '',
  });

  const types = referentiel.data?.typesEntites ?? [];
  const typeChoisi = types.find((type) => type.id === choisi) ?? null;

  return (
    <>
      <EnteteZone
        titre="Types de données"
        sousTitre="Ce qu'on peut décrire dans la centrale. Les enquêteurs créent des données et des faits, jamais des types."
      />

      <div className={styles.atelier}>
        <div className={styles.colonne}>
          <p className={styles.section}>Types</p>

          {referentiel.isLoading && (
            <p className={controles.remarque}>Chargement…</p>
          )}

          {types.length === 0 && !referentiel.isLoading ? (
            <EtatVide
              titre="Aucun type de donnée."
              explication="Commencer par le plus concret — un véhicule, une personne — puis relier."
            />
          ) : (
            <ListeReordonnable
              elements={types}
              desactive={ordonner.isPending}
              onOrdonner={(ids) => ordonner.mutate(ids)}
              rendu={(type) => (
                <button
                  type="button"
                  className={styles.ligneChoisissable}
                  aria-pressed={type.id === choisi}
                  onClick={() => definirChoisi(type.id)}
                >
                  <span className={styles.entreeLibelle}>{type.libelle}</span>{' '}
                  <span className={`${styles.entreeDetail} mono`}>
                    {type.code}
                  </span>
                </button>
              )}
            />
          )}

          <form
            className={styles.panneau}
            onSubmit={(evenement) => {
              evenement.preventDefault();
              creer.mutate(nouveau, {
                onSuccess: (type) => {
                  definirChoisi(type.id);
                  definirNouveau({
                    code: '',
                    libelle: '',
                    libellePluriel: '',
                    icone: '',
                    modeleLibelle: '',
                  });
                },
              });
            }}
          >
            <p className={styles.section}>Nouveau type</p>

            <ChampTexte
              etiquette="Code"
              mono
              valeur={nouveau.code}
              onChange={(code) => definirNouveau({ ...nouveau, code })}
              indication="minuscules et tirets bas — vehicule, type_de_groupe"
            />
            <ChampTexte
              etiquette="Libellé"
              valeur={nouveau.libelle}
              onChange={(libelle) => definirNouveau({ ...nouveau, libelle })}
            />
            <ChampTexte
              etiquette="Libellé au pluriel"
              valeur={nouveau.libellePluriel}
              onChange={(libellePluriel) =>
                definirNouveau({ ...nouveau, libellePluriel })
              }
            />
            <ChoixIcone
              etiquette="Icône"
              valeur={nouveau.icone}
              onChange={(icone) => definirNouveau({ ...nouveau, icone })}
            />
            <ChampTexte
              etiquette="Gabarit de libellé"
              mono
              valeur={nouveau.modeleLibelle}
              onChange={(modeleLibelle) =>
                definirNouveau({ ...nouveau, modeleLibelle })
              }
              indication="{plaque} — les champs cités seront créés ensuite"
            />

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

        <div className={styles.colonne}>
          {typeChoisi ? (
            <PanneauType
              type={typeChoisi}
              onSupprime={() => definirChoisi(null)}
            />
          ) : (
            <EtatVide
              titre="Choisir un type à configurer."
              explication="Ses champs, son gabarit de libellé et ses onglets se règlent ici."
            />
          )}
        </div>
      </div>
    </>
  );
}
