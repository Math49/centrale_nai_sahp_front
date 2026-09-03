'use client';

import { useState } from 'react';

import {
  useColonnes,
  useCreerColonne,
  useModifierColonne,
  useOrdonnerColonnes,
  useSupprimerColonne,
  type ColonneKanban,
} from '@/api/enquetes';
import { GardeSuperAdmin } from '@/auth/garde-super-admin';
import { ChampTexte } from '@/composants/champ-texte';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { ListeReordonnable } from '@/composants/liste-reordonnable';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';

const VIERGE = { code: '', libelle: '' };

export default function PageColonnesEnquetes() {
  return (
    <GardeSuperAdmin>
      <Atelier />
    </GardeSuperAdmin>
  );
}

function Atelier() {
  const colonnes = useColonnes();
  const creer = useCreerColonne();
  const modifier = useModifierColonne();
  const supprimer = useSupprimerColonne();
  const ordonner = useOrdonnerColonnes();

  const [nouvelle, definirNouvelle] = useState(VIERGE);
  const [aRetirer, definirARetirer] = useState<ColonneKanban | null>(null);

  const liste = [...(colonnes.data ?? [])].sort((a, b) => a.ordre - b.ordre);

  return (
    <>
      <EnteteZone
        titre="Colonnes des enquêtes"
        sousTitre="Par quels états passe une enquête. C’est une convention de service, pas une donnée : l’ordre des colonnes est celui du tableau."
      />

      <div className={styles.colonne}>
        <div className={styles.panneau}>
          <p className={styles.section}>Colonnes définies</p>

          {liste.length === 0 ? (
            <EtatVide
              titre="Aucune colonne."
              explication="Sans colonne, le tableau des enquêtes n’a nulle part où poser une carte."
            />
          ) : (
            <ListeReordonnable
              elements={liste}
              onOrdonner={(ids) => ordonner.mutate(ids)}
              desactive={ordonner.isPending}
              rendu={(colonne) => (
                <>
                  <span className={styles.entreeListe}>
                    <span className={styles.entreeLibelle}>
                      {colonne.libelle}
                    </span>
                    <span className={`${styles.entreeDetail} mono`}>
                      {colonne.code}
                    </span>
                  </span>

                  <span className={styles.actionsLigne}>
                    <Renommer colonne={colonne} onModifier={modifier.mutate} />
                    <button
                      type="button"
                      className={styles.retirer}
                      onClick={() => definirARetirer(colonne)}
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
            creer.mutate(nouvelle, {
              onSuccess: () => definirNouvelle(VIERGE),
            });
          }}
        >
          <p className={styles.section}>Nouvelle colonne</p>

          <div className={styles.grilleChamps}>
            <ChampTexte
              etiquette="Code"
              mono
              valeur={nouvelle.code}
              onChange={(code) => definirNouvelle({ ...nouvelle, code })}
              indication="a_faire, en_cours, en_attente…"
            />
            <ChampTexte
              etiquette="Libellé"
              valeur={nouvelle.libelle}
              onChange={(libelle) => definirNouvelle({ ...nouvelle, libelle })}
            />
          </div>

          <p className={controles.remarque}>
            Le code ne se modifie pas après coup : c’est lui qui identifie la
            colonne dans les traces.
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
            {creer.isPending ? 'Création…' : 'Créer la colonne'}
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
            La colonne disparaît du tableau. Le retrait est refusé tant qu’une
            carte s’y trouve — les cartes, elles, s’archivent.
          </p>
          {supprimer.isError && (
            <p className={controles.erreur}>{supprimer.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}

function Renommer({
  colonne,
  onModifier,
}: {
  colonne: ColonneKanban;
  onModifier: (donnees: { id: string; libelle?: string }) => void;
}) {
  const [ouvert, definirOuvert] = useState(false);
  const [libelle, definirLibelle] = useState(colonne.libelle);

  return (
    <>
      <button
        type="button"
        className={styles.retirer}
        onClick={() => {
          definirLibelle(colonne.libelle);
          definirOuvert(true);
        }}
      >
        Renommer
      </button>

      {ouvert && (
        <Modale
          titre={`Renommer « ${colonne.libelle} »`}
          libelleConfirmation="Enregistrer"
          confirmationBloquee={libelle.trim().length === 0}
          onAnnuler={() => definirOuvert(false)}
          onConfirmer={() => {
            onModifier({ id: colonne.id, libelle: libelle.trim() });
            definirOuvert(false);
          }}
        >
          <ChampTexte
            etiquette="Libellé"
            valeur={libelle}
            onChange={definirLibelle}
          />
          <p className={controles.remarque}>
            Le code reste <span className="mono">{colonne.code}</span> : les
            traces s’y adossent.
          </p>
        </Modale>
      )}
    </>
  );
}
