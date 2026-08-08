'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  useHabiliter,
  useModifierDossier,
  useNePlusSuivre,
  usePanneauDossier,
  useRetirerHabilitation,
} from '@/api/dossiers';
import { useSession } from '@/auth/use-session';
import { useAgents } from '@/api/agents';
import controles from './controles.module.css';
import styles from './panneau-dossier.module.css';
import { PastilleVisibilite } from './pastilles';

/**
 * Panneau de dossier.
 *
 * Visible **uniquement lorsqu'on accède à la fiche par le dossier**. Ouvrir la
 * même fiche depuis l'annuaire n'en montre rien : le dossier contextualise une
 * consultation, il ne s'attache pas à l'entité.
 */
export function PanneauDossier({ dossierId }: { dossierId: string }) {
  const panneau = usePanneauDossier(dossierId);
  const modifier = useModifierDossier();
  const nePlusSuivre = useNePlusSuivre();
  const habiliter = useHabiliter();
  const retirer = useRetirerHabilitation();
  const { agent } = useSession();

  const [note, definirNote] = useState<string | null>(null);
  const [deplie, definirDeplie] = useState(true);

  const peutHabiliter =
    agent?.superAdmin || agent?.permissions.includes('dossier.habiliter');

  if (panneau.isError) {
    return null;
  }

  if (!panneau.data) {
    return <p className={controles.remarque}>Ouverture du dossier…</p>;
  }

  const dossier = panneau.data;
  const noteAffichee = note ?? dossier.note ?? '';
  const noteModifiee = note !== null && note !== (dossier.note ?? '');

  return (
    <aside className={styles.panneau}>
      <header className={styles.entete}>
        <div>
          <span className={styles.surtitre}>Dossier</span>
          <h2 className={styles.nom}>
            {dossier.nom} <PastilleVisibilite niveau={dossier.visibilite} />
          </h2>
        </div>

        <div className={styles.actions}>
          <Link
            className={controles.boutonDiscret}
            href={`/entites/nouveau?dossier=${dossier.id}`}
          >
            Saisir depuis ce dossier
          </Link>
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
            <textarea
              className={styles.note}
              value={noteAffichee}
              onChange={(evenement) => definirNote(evenement.target.value)}
              rows={3}
              placeholder="Ce que l’enquête cherche."
            />
            {noteModifiee && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={controles.boutonDiscret}
                  onClick={() => definirNote(null)}
                >
                  Abandonner
                </button>
                <button
                  type="button"
                  className={controles.bouton}
                  disabled={modifier.isPending}
                  onClick={() =>
                    modifier.mutate(
                      { id: dossier.id, note: noteAffichee },
                      { onSuccess: () => definirNote(null) },
                    )
                  }
                >
                  Enregistrer
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </aside>
  );
}

/**
 * L'habilitation est nominative : on désigne un agent, jamais un grade.
 *
 * La liste des comptes exige `agent.gerer` ; si l'API la refuse, le champ se
 * tait plutôt que d'afficher une erreur sur un écran qui n'en est pas le sujet.
 */
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
