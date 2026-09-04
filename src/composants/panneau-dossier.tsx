'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  useArchiverDossier,
  useHabiliter,
  useModifierDossier,
  useNePlusSuivre,
  usePanneauDossier,
  useRetirerHabilitation,
} from '@/api/dossiers';
import { useSession } from '@/auth/use-session';
import { useAgents } from '@/api/agents';
import controles from './controles.module.css';
import { FormulaireModificationDossier } from './formulaire-modification-dossier';
import { Modale } from './modale';
import styles from './panneau-dossier.module.css';
import { PastilleVisibilite } from './pastilles';

export function PanneauDossier({ dossierId }: { dossierId: string }) {
  const panneau = usePanneauDossier(dossierId);
  const modifier = useModifierDossier();
  const archiver = useArchiverDossier();
  const nePlusSuivre = useNePlusSuivre();
  const habiliter = useHabiliter();
  const retirer = useRetirerHabilitation();
  const { agent } = useSession();

  const [deplie, definirDeplie] = useState(true);
  const [aReprendre, definirAReprendre] = useState(false);
  const [aArchiver, definirAArchiver] = useState(false);

  const peutHabiliter =
    agent?.superAdmin || agent?.permissions.includes('dossier.habiliter');

  // Retirer une donnée du suivi et reprendre le nom ou la note relèvent du même
  // geste, `dossier.modifier` : ce sont deux façons de toucher au périmètre.
  const peutModifier =
    agent?.superAdmin || agent?.permissions.includes('dossier.modifier');

  // Sortir un dossier de la circulation est un geste à part, comme pour une
  // donnée : on peut renommer une enquête sans avoir le droit de la clore.
  const peutArchiver =
    agent?.superAdmin || agent?.permissions.includes('dossier.archiver');

  if (panneau.isError) {
    return null;
  }

  if (!panneau.data) {
    return <p className={controles.remarque}>Ouverture du dossier…</p>;
  }

  const dossier = panneau.data;
  const archive = dossier.etat === 'archive';

  return (
    <aside className={styles.panneau}>
      <header className={styles.entete}>
        <div>
          <span className={styles.surtitre}>Dossier</span>
          <h2 className={styles.nom}>
            {dossier.nom} <PastilleVisibilite niveau={dossier.visibilite} />
            {archive && <span className={styles.archive}>archivé</span>}
          </h2>
        </div>

        <div className={styles.actions}>
          {!archive && (
            <Link
              className={controles.boutonDiscret}
              href={`/entites/nouveau?dossier=${dossier.id}`}
            >
              Saisir depuis ce dossier
            </Link>
          )}

          {peutModifier && dossier.contenuLisible && (
            <button
              type="button"
              className={controles.boutonDiscret}
              onClick={() => definirAReprendre(true)}
            >
              Modifier
            </button>
          )}

          {peutArchiver && dossier.contenuLisible && (
            <button
              type="button"
              className={controles.boutonDiscret}
              onClick={() => {
                if (archive) {
                  archiver.mutate({ id: dossier.id, archiver: false });
                  return;
                }
                definirAArchiver(true);
              }}
            >
              {archive ? 'Réactiver' : 'Archiver'}
            </button>
          )}

          <button
            type="button"
            className={styles.replier}
            onClick={() => definirDeplie((ouvert) => !ouvert)}
            aria-expanded={deplie}
          >
            {deplie ? 'Replier' : 'Déplier'}
          </button>
        </div>
      </header>

      {!dossier.contenuLisible && (
        <p className={controles.remarque}>
          Dossier restreint : son nom s’affiche, son contenu non.
        </p>
      )}

      {deplie && dossier.contenuLisible && (
        <>
          <div className={styles.corps}>
            <section className={styles.colonne}>
              <h3 className={styles.section}>
                Suivi
                <span className={styles.compteur}>{dossier.nombreSuivis}</span>
              </h3>

              <ul className={styles.liste}>
                {dossier.suivis.map((suivi) => (
                  <li key={suivi.id} className={styles.ligne}>
                    <Link
                      className={styles.lien}
                      href={`/entites/${suivi.id}?dossier=${dossier.id}`}
                    >
                      {suivi.libelle}
                    </Link>
                    {suivi.estPivot ? (
                      <span className={styles.marque}>pivot</span>
                    ) : (
                      peutModifier && (
                        <button
                          type="button"
                          className={styles.retirer}
                          onClick={() =>
                            nePlusSuivre.mutate({
                              dossierId: dossier.id,
                              entiteId: suivi.id,
                            })
                          }
                        >
                          retirer
                        </button>
                      )
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.colonne}>
              <h3 className={styles.section}>
                Habilitations
                <span className={styles.compteur}>
                  {dossier.habilitations.length}
                </span>
              </h3>

              {dossier.habilitations.length === 0 ? (
                <p className={controles.remarque}>
                  Personne n’y est nommément habilité.
                </p>
              ) : (
                <ul className={styles.liste}>
                  {dossier.habilitations.map((habilitation) => (
                    <li key={habilitation.agentId} className={styles.ligne}>
                      <span>{habilitation.libelle}</span>
                      <span className={`${styles.matricule} mono`}>
                        {habilitation.matricule}
                      </span>
                      {peutHabiliter && (
                        <button
                          type="button"
                          className={styles.retirer}
                          onClick={() =>
                            retirer.mutate({
                              dossierId: dossier.id,
                              agentId: habilitation.agentId,
                            })
                          }
                        >
                          retirer
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {peutHabiliter && (
                <AjoutHabilitation
                  dossierId={dossier.id}
                  dejaHabilites={dossier.habilitations.map(
                    (habilitation) => habilitation.agentId,
                  )}
                  onAjouter={(agentId) =>
                    habiliter.mutate({ dossierId: dossier.id, agentId })
                  }
                />
              )}
            </section>
          </div>

          <section>
            <h3 className={styles.section}>Note du dossier</h3>
            {/* Un champ non renseigné reste affiché : l'absence d'information
                est une information. La reprise passe par la modale, comme
                toute écriture. */}
            <p className={styles.note}>{dossier.note ?? 'Aucune note.'}</p>
          </section>
        </>
      )}

      {aReprendre && (
        <FormulaireModificationDossier
          valeursInitiales={{
            nom: dossier.nom,
            note: dossier.note ?? '',
            visibilite: dossier.visibilite,
          }}
          enCours={modifier.isPending}
          erreur={modifier.isError ? modifier.error.message : null}
          onAnnuler={() => definirAReprendre(false)}
          onEnregistrer={(valeurs) =>
            modifier.mutate(
              {
                id: dossier.id,
                nom: valeurs.nom,
                note: valeurs.note,
                visibilite: valeurs.visibilite,
              },
              { onSuccess: () => definirAReprendre(false) },
            )
          }
        />
      )}

      {aArchiver && (
        <Modale
          titre={`Archiver « ${dossier.nom} » ?`}
          libelleConfirmation="Archiver"
          enCours={archiver.isPending}
          onAnnuler={() => definirAArchiver(false)}
          onConfirmer={() =>
            archiver.mutate(
              { id: dossier.id, archiver: true },
              { onSuccess: () => definirAArchiver(false) },
            )
          }
        >
          <p>
            Le dossier quitte la liste courante et <strong>reste entier</strong>{' '}
            : son suivi, ses habilitations, et les faits qui y ont été saisis,
            dont il reste le gardien. Rien ne se détache, rien ne se déclasse.
          </p>
          <p className={controles.remarque}>
            Il se retrouve en cochant « archives » sur la liste des dossiers, et
            se réactive d’un bouton.
          </p>
          {archiver.isError && (
            <p className={controles.erreur}>{archiver.error.message}</p>
          )}
        </Modale>
      )}
    </aside>
  );
}

function AjoutHabilitation({
  dejaHabilites,
  onAjouter,
}: {
  dossierId: string;
  dejaHabilites: string[];
  onAjouter: (agentId: string) => void;
}) {
  const agents = useAgents();
  const [choisi, definirChoisi] = useState('');

  if (!agents.isSuccess) {
    return null;
  }

  const candidats = agents.data.filter(
    (agent) => !dejaHabilites.includes(agent.id) && !agent.anonymise,
  );

  return (
    <div className={styles.ajout}>
      <select
        className={controles.champ}
        value={choisi}
        onChange={(evenement) => definirChoisi(evenement.target.value)}
        aria-label="Agent à habiliter"
      >
        <option value="">Habiliter un agent…</option>
        {candidats.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.libelle} · {agent.matricule}
          </option>
        ))}
      </select>
      <button
        type="button"
        className={controles.boutonDiscret}
        disabled={choisi === ''}
        onClick={() => {
          onAjouter(choisi);
          definirChoisi('');
        }}
      >
        Habiliter
      </button>
    </div>
  );
}
