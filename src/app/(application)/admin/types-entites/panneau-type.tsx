'use client';

import { useEffect, useState } from 'react';

import {
  LIBELLES_TYPES_DONNEES,
  useCreerChamp,
  useModifierChamp,
  useModifierTypeEntite,
  useOrdonnerChamps,
  useSupprimerChamp,
  useSupprimerTypeEntite,
  type DefinitionChamp,
  type TypeDonnee,
  type TypeEntite,
} from '@/api/referentiel';
import { ChoixIcone } from '@/composants/choix-icone';
import { ChampTexte } from '@/composants/champ-texte';
import controles from '@/composants/controles.module.css';
import { ListeReordonnable } from '@/composants/liste-reordonnable';
import { Modale } from '@/composants/modale';
import styles from '../administration.module.css';

const TYPES_DONNEES = Object.keys(LIBELLES_TYPES_DONNEES) as TypeDonnee[];

const CHAMP_VIERGE = {
  cle: '',
  libelle: '',
  typeDonnee: 'texte' as TypeDonnee,
  obligatoire: false,
  estUnique: false,
  multiple: false,
  options: '',
};

export function PanneauType({
  type,
  onSupprime,
}: {
  type: TypeEntite;
  onSupprime: () => void;
}) {
  const modifier = useModifierTypeEntite();
  const supprimerType = useSupprimerTypeEntite();
  const creerChamp = useCreerChamp();
  const modifierChamp = useModifierChamp();
  const supprimerChamp = useSupprimerChamp();
  const ordonner = useOrdonnerChamps();

  const [proprietes, definirProprietes] = useState({
    libelle: type.libelle,
    libellePluriel: type.libellePluriel,
    icone: type.icone,
    modeleLibelle: type.modeleLibelle,
  });

  const [nouveau, definirNouveau] = useState(CHAMP_VIERGE);
  const [aModifier, definirAModifier] = useState<{
    id: string;
    cle: string;
    typeDonnee: TypeDonnee;
    libelle: string;
    obligatoire: boolean;
    estUnique: boolean;
    multiple: boolean;
    options: string;
  } | null>(null);
  const [aSupprimer, definirASupprimer] = useState<DefinitionChamp | null>(
    null,
  );
  const [suppressionDuType, definirSuppressionDuType] = useState(false);

  useEffect(() => {
    definirProprietes({
      libelle: type.libelle,
      libellePluriel: type.libellePluriel,
      icone: type.icone,
      modeleLibelle: type.modeleLibelle,
    });
    definirNouveau(CHAMP_VIERGE);
    definirAModifier(null);
  }, [
    type.id,
    type.libelle,
    type.libellePluriel,
    type.icone,
    type.modeleLibelle,
  ]);

  const estListe = nouveau.typeDonnee === 'liste';

  return (
    <>
      <form
        className={styles.panneau}
        onSubmit={(evenement) => {
          evenement.preventDefault();
          modifier.mutate({ id: type.id, ...proprietes });
        }}
      >
        <p className={styles.section}>
          Propriétés — <span className="mono">{type.code}</span>
        </p>

        <div className={styles.grilleChamps}>
          <ChampTexte
            etiquette="Libellé"
            valeur={proprietes.libelle}
            onChange={(libelle) =>
              definirProprietes({ ...proprietes, libelle })
            }
          />
          <ChampTexte
            etiquette="Libellé au pluriel"
            valeur={proprietes.libellePluriel}
            onChange={(libellePluriel) =>
              definirProprietes({ ...proprietes, libellePluriel })
            }
          />
          <ChoixIcone
            etiquette="Icône"
            valeur={proprietes.icone}
            onChange={(icone) => definirProprietes({ ...proprietes, icone })}
          />
          <ChampTexte
            etiquette="Gabarit de libellé"
            mono
            valeur={proprietes.modeleLibelle}
            onChange={(modeleLibelle) =>
              definirProprietes({ ...proprietes, modeleLibelle })
            }
          />
        </div>

        <p className={styles.apercu}>
          Une fiche s&apos;appellera :{' '}
          <span className="mono">
            {apercu(proprietes.modeleLibelle, type.champs)}
          </span>
        </p>

        {modifier.isError && (
          <p className={controles.erreur} role="alert">
            {modifier.error.message}
          </p>
        )}

        <div className={styles.actionsLigne}>
          <button
            type="submit"
            className={controles.bouton}
            disabled={modifier.isPending}
          >
            {modifier.isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => definirSuppressionDuType(true)}
          >
            Supprimer le type
          </button>
        </div>
      </form>

      <div className={styles.panneau}>
        <p className={styles.section}>Champs</p>

        {type.champs.length === 0 ? (
          <p className={controles.remarque}>
            Aucun champ. Le gabarit de libellé ne pourra rien citer tant
            qu&apos;il n&apos;y en a pas.
          </p>
        ) : (
          <ListeReordonnable
            elements={type.champs}
            desactive={ordonner.isPending}
            onOrdonner={(ids) =>
              ordonner.mutate({ typeEntiteId: type.id, ids })
            }
            rendu={(champ) => (
              <div className={styles.entreeListe}>
                <span className={styles.entreeLibelle}>{champ.libelle}</span>
                <span className={`${styles.entreeDetail} mono`}>
                  {champ.cle}
                </span>
                <span className={styles.entreeDetail}>
                  {LIBELLES_TYPES_DONNEES[champ.typeDonnee]}
                </span>
                <span className={styles.marqueurs}>
                  {champ.obligatoire && (
                    <span className={styles.marqueur}>obligatoire</span>
                  )}
                  {champ.estUnique && (
                    <span className={styles.marqueur}>unique</span>
                  )}
                  {champ.multiple && (
                    <span className={styles.marqueur}>multiple</span>
                  )}
                </span>
                <div className={styles.actionsLigne}>
                  <button
                    type="button"
                    className={styles.retirer}
                    onClick={() =>
                      definirAModifier({
                        id: champ.id,
                        cle: champ.cle,
                        typeDonnee: champ.typeDonnee,
                        libelle: champ.libelle,
                        obligatoire: champ.obligatoire,
                        estUnique: champ.estUnique,
                        multiple: champ.multiple,
                        options: (champ.options ?? []).join(', '),
                      })
                    }
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className={styles.retirer}
                    onClick={() => definirASupprimer(champ)}
                  >
                    Retirer
                  </button>
                </div>
              </div>
            )}
          />
        )}

        <form
          onSubmit={(evenement) => {
            evenement.preventDefault();
            creerChamp.mutate(
              {
                typeEntiteId: type.id,
                cle: nouveau.cle,
                libelle: nouveau.libelle,
                typeDonnee: nouveau.typeDonnee,
                obligatoire: nouveau.obligatoire,
                estUnique: nouveau.estUnique,
                multiple: nouveau.multiple,
                ...(estListe
                  ? {
                      options: nouveau.options
                        .split(',')
                        .map((valeur) => valeur.trim())
                        .filter((valeur) => valeur.length > 0),
                    }
                  : {}),
              },
              { onSuccess: () => definirNouveau(CHAMP_VIERGE) },
            );
          }}
        >
          <div className={styles.formulaireEnLigne}>
            <ChampTexte
              etiquette="Clé"
              mono
              valeur={nouveau.cle}
              onChange={(cle) => definirNouveau({ ...nouveau, cle })}
            />
            <ChampTexte
              etiquette="Libellé"
              valeur={nouveau.libelle}
              onChange={(libelle) => definirNouveau({ ...nouveau, libelle })}
            />
            <label className={controles.groupe}>
              <span className={controles.etiquette}>Type de donnée</span>
              <select
                className={controles.champ}
                value={nouveau.typeDonnee}
                onChange={(evenement) =>
                  definirNouveau({
                    ...nouveau,
                    typeDonnee: evenement.target.value as TypeDonnee,
                  })
                }
              >
                {TYPES_DONNEES.map((donnee) => (
                  <option key={donnee} value={donnee}>
                    {LIBELLES_TYPES_DONNEES[donnee]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {estListe && (
            <label className={controles.groupe} style={{ marginTop: 12 }}>
              <span className={controles.etiquette}>Valeurs autorisées</span>
              <input
                className={controles.champ}
                value={nouveau.options}
                onChange={(evenement) =>
                  definirNouveau({
                    ...nouveau,
                    options: evenement.target.value,
                  })
                }
                placeholder="gris, noir, blanc"
                required
              />
              <span className={controles.remarque}>
                séparées par des virgules
              </span>
            </label>
          )}

          <div className={styles.actionsLigne} style={{ marginTop: 12 }}>
            <Bascule
              libelle="obligatoire"
              actif={nouveau.obligatoire}
              onChange={(obligatoire) =>
                definirNouveau({ ...nouveau, obligatoire })
              }
            />
            <Bascule
              libelle="unique"
              actif={nouveau.estUnique}
              onChange={(estUnique) =>
                definirNouveau({ ...nouveau, estUnique, multiple: false })
              }
            />
            <Bascule
              libelle="multiple"
              actif={nouveau.multiple}
              onChange={(multiple) =>
                definirNouveau({ ...nouveau, multiple, estUnique: false })
              }
            />
          </div>

          {creerChamp.isError && (
            <p
              className={controles.erreur}
              role="alert"
              style={{ marginTop: 12 }}
            >
              {creerChamp.error.message}
            </p>
          )}

          <button
            type="submit"
            className={controles.bouton}
            style={{ marginTop: 12 }}
            disabled={creerChamp.isPending}
          >
            Ajouter le champ
          </button>
        </form>
      </div>

      {aModifier && (
        <Modale
          titre={`Modifier le champ Â« ${aModifier.cle} Â»`}
          enCours={modifierChamp.isPending}
          libelleConfirmation="Enregistrer"
          confirmationBloquee={
            aModifier.libelle.trim().length === 0 ||
            (aModifier.typeDonnee === 'liste' &&
              aModifier.options
                .split(',')
                .map((valeur) => valeur.trim())
                .filter((valeur) => valeur.length > 0).length === 0)
          }
          onAnnuler={() => definirAModifier(null)}
          onConfirmer={() =>
            modifierChamp.mutate(
              {
                id: aModifier.id,
                libelle: aModifier.libelle.trim(),
                obligatoire: aModifier.obligatoire,
                estUnique: aModifier.estUnique,
                multiple: aModifier.multiple,
                ...(aModifier.typeDonnee === 'liste'
                  ? {
                      options: aModifier.options
                        .split(',')
                        .map((valeur) => valeur.trim())
                        .filter((valeur) => valeur.length > 0),
                    }
                  : {}),
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
            <label className={controles.groupe}>
              <span className={controles.etiquette}>Type de donnÃ©e</span>
              <input
                className={controles.champ}
                value={LIBELLES_TYPES_DONNEES[aModifier.typeDonnee]}
                disabled
              />
            </label>
          </div>

          {aModifier.typeDonnee === 'liste' && (
            <label className={controles.groupe}>
              <span className={controles.etiquette}>Valeurs autorisÃ©es</span>
              <input
                className={controles.champ}
                value={aModifier.options}
                onChange={(evenement) =>
                  definirAModifier({
                    ...aModifier,
                    options: evenement.target.value,
                  })
                }
                placeholder="gris, noir, blanc"
                required
              />
              <span className={controles.remarque}>
                sÃ©parÃ©es par des virgules
              </span>
            </label>
          )}

          <div className={styles.actionsLigne}>
            <Bascule
              libelle="obligatoire"
              actif={aModifier.obligatoire}
              onChange={(obligatoire) =>
                definirAModifier({ ...aModifier, obligatoire })
              }
            />
            <Bascule
              libelle="unique"
              actif={aModifier.estUnique}
              onChange={(estUnique) =>
                definirAModifier({
                  ...aModifier,
                  estUnique,
                  multiple: false,
                })
              }
            />
            <Bascule
              libelle="multiple"
              actif={aModifier.multiple}
              onChange={(multiple) =>
                definirAModifier({
                  ...aModifier,
                  multiple,
                  estUnique: false,
                })
              }
            />
          </div>

          <p className={controles.remarque}>
            La cle et le type de donnee restent fixes pour conserver les faits
            deja saisis.
          </p>

          {modifierChamp.isError && (
            <p className={controles.erreur}>{modifierChamp.error.message}</p>
          )}
        </Modale>
      )}

      {aSupprimer && (
        <Modale
          titre={`Retirer le champ « ${aSupprimer.libelle} » ?`}
          irreversible
          enCours={supprimerChamp.isPending}
          libelleConfirmation="Retirer"
          onAnnuler={() => definirASupprimer(null)}
          onConfirmer={() =>
            supprimerChamp.mutate(aSupprimer.id, {
              onSuccess: () => definirASupprimer(null),
            })
          }
        >
          <p>
            Le champ disparaît du formulaire de toutes les fiches de ce type.
          </p>
          {supprimerChamp.isError && (
            <p className={controles.erreur}>{supprimerChamp.error.message}</p>
          )}
        </Modale>
      )}

      {suppressionDuType && (
        <Modale
          titre={`Supprimer le type « ${type.libelle} » ?`}
          irreversible
          enCours={supprimerType.isPending}
          libelleConfirmation="Supprimer"
          onAnnuler={() => definirSuppressionDuType(false)}
          onConfirmer={() =>
            supprimerType.mutate(type.id, {
              onSuccess: () => {
                definirSuppressionDuType(false);
                onSupprime();
              },
            })
          }
        >
          <p>
            Ses champs et ses onglets partent avec lui. La suppression est
            refusée dès qu&apos;une donnée de ce type existe.
          </p>
          {supprimerType.isError && (
            <p className={controles.erreur}>{supprimerType.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}

function Bascule({
  libelle,
  actif,
  onChange,
}: {
  libelle: string;
  actif: boolean;
  onChange: (actif: boolean) => void;
}) {
  return (
    <label className={styles.marqueur} style={{ cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={actif}
        onChange={(evenement) => onChange(evenement.target.checked)}
        style={{ marginRight: 6 }}
      />
      {libelle}
    </label>
  );
}

function apercu(modele: string, champs: DefinitionChamp[]): string {
  const rendu = modele.replace(/\{([^{}]*)\}/g, (_entier, cle: string) => {
    const champ = champs.find((candidat) => candidat.cle === cle);
    return champ ? `‹${champ.libelle}›` : `‹${cle} ?›`;
  });

  return rendu.trim() || '—';
}
