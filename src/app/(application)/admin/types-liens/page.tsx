'use client';

import { useState } from 'react';

import {
  useCreerTypeLien,
  useModifierTypeLien,
  useReferentiel,
  useSupprimerTypeLien,
  type TypeLien,
} from '@/api/referentiel';
import { GardeSuperAdmin } from '@/auth/garde-super-admin';
import { ChampTexte } from '@/composants/champ-texte';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';

const VIERGE = {
  code: '',
  libelle: '',
  libelleInverse: '',
  typeEntiteSourceId: '',
  typeEntiteCibleId: '',
  multiple: true,
};

export default function PageTypesLiens() {
  return (
    <GardeSuperAdmin>
      <Atelier />
    </GardeSuperAdmin>
  );
}

function Atelier() {
  const referentiel = useReferentiel();
  const creer = useCreerTypeLien();
  const modifier = useModifierTypeLien();
  const supprimer = useSupprimerTypeLien();

  const [nouveau, definirNouveau] = useState(VIERGE);
  const [aModifier, definirAModifier] = useState<{
    id: string;
    code: string;
    libelle: string;
    libelleInverse: string;
    multiple: boolean;
  } | null>(null);
  const [aSupprimer, definirASupprimer] = useState<TypeLien | null>(null);

  const types = referentiel.data?.typesEntites ?? [];
  const liens = referentiel.data?.typesLiens ?? [];

  const nommer = (id: string): string =>
    types.find((type) => type.id === id)?.libelle ?? '—';

  return (
    <>
      <EnteteZone
        titre="Types de liens"
        sousTitre="Spécifiques plutôt que génériques : « interpellé lors de » vaut mieux qu'un « identifié lors de » complété d'un texte libre. La nuance est exploitable par le graphe et par les filtres."
      />

      <div className={styles.colonne}>
        <div className={styles.panneau}>
          <p className={styles.section}>Liens définis</p>

          {liens.length === 0 ? (
            <EtatVide
              titre="Aucun type de lien."
              explication="Un lien est une arête unique, lue des deux côtés : il porte donc deux libellés, un par sens."
            />
          ) : (
            <table className={styles.tableau}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Libellé</th>
                  <th>Libellé inverse</th>
                  <th>Domaine</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {liens.map((lien) => (
                  <tr key={lien.id}>
                    <td className="mono">{lien.code}</td>
                    <td>{lien.libelle}</td>
                    <td className={styles.domaine}>{lien.libelleInverse}</td>
                    <td className={styles.domaine}>
                      {nommer(lien.typeEntiteSourceId)} →{' '}
                      {nommer(lien.typeEntiteCibleId)}
                      {!lien.multiple && ' · unique'}
                    </td>
                    <td>
                      <div className={styles.actionsLigne}>
                        <button
                          type="button"
                          className={styles.retirer}
                          onClick={() =>
                            definirAModifier({
                              id: lien.id,
                              code: lien.code,
                              libelle: lien.libelle,
                              libelleInverse: lien.libelleInverse,
                              multiple: lien.multiple,
                            })
                          }
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className={styles.retirer}
                          onClick={() => definirASupprimer(lien)}
                        >
                          Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form
          className={styles.panneau}
          onSubmit={(evenement) => {
            evenement.preventDefault();
            creer.mutate(nouveau, {
              onSuccess: () => definirNouveau(VIERGE),
            });
          }}
        >
          <p className={styles.section}>Nouveau type de lien</p>

          <div className={styles.grilleChamps}>
            <ChampTexte
              etiquette="Code"
              mono
              valeur={nouveau.code}
              onChange={(code) => definirNouveau({ ...nouveau, code })}
              indication="proprietaire_de"
            />
            <ChampTexte
              etiquette="Libellé"
              valeur={nouveau.libelle}
              onChange={(libelle) => definirNouveau({ ...nouveau, libelle })}
              indication="lu depuis la source"
            />
            <ChampTexte
              etiquette="Libellé inverse"
              valeur={nouveau.libelleInverse}
              onChange={(libelleInverse) =>
                definirNouveau({ ...nouveau, libelleInverse })
              }
              indication="le même lien, lu depuis la cible"
            />
          </div>

          <div className={styles.grilleChamps}>
            <ChoixType
              etiquette="Type source"
              valeur={nouveau.typeEntiteSourceId}
              types={types}
              onChange={(typeEntiteSourceId) =>
                definirNouveau({ ...nouveau, typeEntiteSourceId })
              }
            />
            <ChoixType
              etiquette="Type cible"
              valeur={nouveau.typeEntiteCibleId}
              types={types}
              onChange={(typeEntiteCibleId) =>
                definirNouveau({ ...nouveau, typeEntiteCibleId })
              }
            />
          </div>

          <p className={styles.apercu}>
            {nouveau.typeEntiteSourceId && nouveau.typeEntiteCibleId ? (
              <>
                {nommer(nouveau.typeEntiteSourceId)}{' '}
                <strong>{nouveau.libelle || '…'}</strong>{' '}
                {nommer(nouveau.typeEntiteCibleId)} — et en sens inverse,{' '}
                {nommer(nouveau.typeEntiteCibleId)}{' '}
                <strong>{nouveau.libelleInverse || '…'}</strong>{' '}
                {nommer(nouveau.typeEntiteSourceId)}.
              </>
            ) : (
              'Choisir les deux extrémités pour voir la phrase que ce lien produira.'
            )}
          </p>

          <label className={styles.marqueur} style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={nouveau.multiple}
              onChange={(evenement) =>
                definirNouveau({
                  ...nouveau,
                  multiple: evenement.target.checked,
                })
              }
              style={{ marginRight: 6 }}
            />
            plusieurs cibles possibles
          </label>

          <p className={controles.remarque}>
            Les contraintes de domaine sont définitives : des liens déjà posés
            les respectent, et les changer les invaliderait rétroactivement.
          </p>

          {creer.isError && (
            <p className={controles.erreur} role="alert">
              {creer.error.message}
            </p>
          )}

          <button
            type="submit"
            className={controles.bouton}
            disabled={creer.isPending || types.length === 0}
          >
            {creer.isPending ? 'Création…' : 'Créer le type de lien'}
          </button>
        </form>
      </div>

      {aModifier && (
        <Modale
          titre={`Modifier Â« ${aModifier.code} Â»`}
          enCours={modifier.isPending}
          libelleConfirmation="Enregistrer"
          confirmationBloquee={
            aModifier.libelle.trim().length === 0 ||
            aModifier.libelleInverse.trim().length === 0
          }
          onAnnuler={() => definirAModifier(null)}
          onConfirmer={() =>
            modifier.mutate(
              {
                id: aModifier.id,
                libelle: aModifier.libelle.trim(),
                libelleInverse: aModifier.libelleInverse.trim(),
                multiple: aModifier.multiple,
              },
              { onSuccess: () => definirAModifier(null) },
            )
          }
        >
          <div className={styles.grilleChamps}>
            <ChampTexte
              etiquette="LibellÃ©"
              valeur={aModifier.libelle}
              onChange={(libelle) =>
                definirAModifier({ ...aModifier, libelle })
              }
            />
            <ChampTexte
              etiquette="LibellÃ© inverse"
              valeur={aModifier.libelleInverse}
              onChange={(libelleInverse) =>
                definirAModifier({ ...aModifier, libelleInverse })
              }
            />
          </div>

          <label className={styles.marqueur} style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={aModifier.multiple}
              onChange={(evenement) =>
                definirAModifier({
                  ...aModifier,
                  multiple: evenement.target.checked,
                })
              }
              style={{ marginRight: 6 }}
            />
            plusieurs cibles possibles
          </label>

          <p className={controles.remarque}>
            Le code et le domaine ne se modifient pas ici : des faits peuvent
            deja s&apos;appuyer dessus.
          </p>

          {modifier.isError && (
            <p className={controles.erreur}>{modifier.error.message}</p>
          )}
        </Modale>
      )}

      {aSupprimer && (
        <Modale
          titre={`Retirer « ${aSupprimer.libelle} » ?`}
          irreversible
          enCours={supprimer.isPending}
          libelleConfirmation="Retirer"
          onAnnuler={() => definirASupprimer(null)}
          onConfirmer={() =>
            supprimer.mutate(aSupprimer.id, {
              onSuccess: () => definirASupprimer(null),
            })
          }
        >
          <p>
            Le lien disparaît des onglets qui le regroupent. La suppression est
            refusée dès qu&apos;un fait l&apos;utilise.
          </p>
          {supprimer.isError && (
            <p className={controles.erreur}>{supprimer.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}

function ChoixType({
  etiquette,
  valeur,
  types,
  onChange,
}: {
  etiquette: string;
  valeur: string;
  types: { id: string; libelle: string }[];
  onChange: (valeur: string) => void;
}) {
  return (
    <label className={controles.groupe}>
      <span className={controles.etiquette}>{etiquette}</span>
      <select
        className={controles.champ}
        value={valeur}
        onChange={(evenement) => onChange(evenement.target.value)}
        required
      >
        <option value="">—</option>
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.libelle}
          </option>
        ))}
      </select>
    </label>
  );
}
