'use client';

import { useState } from 'react';

import { useAgents } from '@/api/agents';
import {
  useArchiverCarte,
  useHabiliterSurCarte,
  useModifierCarte,
  useRetirerHabilitationSurCarte,
  type CarteEnquete,
} from '@/api/enquetes';
import { usePermission } from '@/auth/use-permission';
import controles from '@/composants/controles.module.css';
import { Modale } from '@/composants/modale';
import { PastilleVisibilite } from '@/composants/pastilles';
import styles from './enquetes.module.css';

const VISIBILITES = ['public', 'restreint', 'prive'] as const;

const LIBELLES_VISIBILITE: Record<(typeof VISIBILITES)[number], string> = {
  public: 'Public',
  restreint: 'Restreint',
  prive: 'Privé',
};

/**
 * Le détail d'une carte, en modale.
 *
 * **Assigner et habiliter y sont deux gestes distincts, et l'écran le dit.**
 * Assigner désigne qui travaille ; habiliter donne le droit de lire. Sur une
 * carte classée, un assigné non habilité ne la voit pas — l'écran l'annonce et
 * *propose* de l'habiliter, sans jamais le faire d'office : ouvrir un accès en
 * douce serait une porte dérobée dans le moteur de visibilité.
 */
export function PanneauCarte({
  carte,
  surFermeture,
}: {
  carte: CarteEnquete;
  surFermeture: () => void;
}) {
  const peutEcrire = usePermission('kanban.ecrire');
  const peutArchiver = usePermission('kanban.archiver');
  const peutHabiliter = usePermission('dossier.habiliter');
  const peutClasser = usePermission('visibilite.definir');

  const modifier = useModifierCarte();
  const archiver = useArchiverCarte();
  const habiliter = useHabiliterSurCarte();
  const retirerHabilitation = useRetirerHabilitationSurCarte();
  const agents = useAgents();

  const [titre, definirTitre] = useState(carte.titre);
  const [description, definirDescription] = useState(carte.description ?? '');
  const [visibilite, definirVisibilite] = useState(carte.visibilite);
  const [choisi, definirChoisi] = useState('');
  const [aArchiver, definirAArchiver] = useState(false);

  const assignes = carte.assignes;
  const dejaAssignes = assignes.map((agent) => agent.agentId);

  const candidats = (agents.data ?? []).filter(
    (agent) => !dejaAssignes.includes(agent.id) && !agent.anonymise,
  );

  const aveugles = assignes.filter((agent) => !agent.peutLire);

  const modifie =
    titre !== carte.titre ||
    description !== (carte.description ?? '') ||
    visibilite !== carte.visibilite;

  const assigner = (agentId: string) =>
    modifier.mutate(
      { id: carte.id, assignes: [...dejaAssignes, agentId] },
      { onSuccess: () => definirChoisi('') },
    );

  return (
    <Modale
      titre={carte.titre}
      libelleConfirmation="Enregistrer"
      enCours={modifier.isPending}
      confirmationBloquee={!modifie || titre.trim().length === 0}
      large
      onAnnuler={surFermeture}
      onConfirmer={() =>
        modifier.mutate(
          {
            id: carte.id,
            titre: titre.trim(),
            description,
            visibilite,
          },
          { onSuccess: surFermeture },
        )
      }
    >
      <p className={controles.remarque}>
        Ouverte par {carte.auteurLibelle} le{' '}
        <span className="mono">{carte.creeLe.slice(0, 10)}</span>
        {carte.dossier && (
          <>
            {' · dossier : '}
            {carte.dossier.libelle ?? 'objet non consultable'}
          </>
        )}
      </p>

      <PastilleVisibilite niveau={carte.visibilite} />

      <label className={controles.groupe}>
        <span className={controles.etiquette}>Titre</span>
        <input
          className={controles.champ}
          value={titre}
          readOnly={!peutEcrire}
          onChange={(evenement) => definirTitre(evenement.target.value)}
        />
      </label>

      <label className={controles.groupe}>
        <span className={controles.etiquette}>Description</span>
        <textarea
          className={controles.champ}
          rows={4}
          value={description}
          readOnly={!peutEcrire}
          onChange={(evenement) => definirDescription(evenement.target.value)}
          placeholder={
            peutEcrire
              ? 'Ce qu’il y a à faire, et pourquoi.'
              : 'Aucune description. La reprendre relève du grade.'
          }
        />
      </label>

      {peutClasser && (
        <label className={controles.groupe}>
          <span className={controles.etiquette}>Visibilité</span>
          <select
            className={controles.champ}
            value={visibilite}
            onChange={(evenement) =>
              definirVisibilite(
                evenement.target.value as (typeof VISIBILITES)[number],
              )
            }
          >
            {VISIBILITES.map((niveau) => (
              <option key={niveau} value={niveau}>
                {LIBELLES_VISIBILITE[niveau]}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* ───────────────────────── Assignés ───────────────────────── */}

      <section>
        <p className={controles.etiquette}>Qui s’en occupe</p>

        {assignes.length === 0 ? (
          <p className={controles.remarque}>Personne n’y est assigné.</p>
        ) : (
          <ul className={styles.listeAgents}>
            {assignes.map((agent) => (
              <li key={agent.agentId} className={styles.ligneAgent}>
                <span
                  className={styles.pastilleAgent}
                  data-aveugle={!agent.peutLire}
                >
                  {agent.initiales}
                </span>
                <span>{agent.libelle}</span>
                <span className={`${styles.matricule} mono`}>
                  {agent.matricule}
                </span>
                {peutEcrire && (
                  <button
                    type="button"
                    className={styles.fleche}
                    onClick={() =>
                      modifier.mutate({
                        id: carte.id,
                        assignes: dejaAssignes.filter(
                          (id) => id !== agent.agentId,
                        ),
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

        {aveugles.length > 0 && (
          <p className={styles.avertissement}>
            <span>
              {aveugles.length === 1
                ? `${aveugles[0].libelle} est assigné mais `
                : `${aveugles.length} agents sont assignés mais `}
              <strong>ne voit pas cette carte</strong> : elle est classée, et
              l’assignation n’ouvre aucun accès. Il faut l’habiliter
              {peutHabiliter
                ? ' ci-dessous.'
                : ' — cela relève de votre grade.'}
            </span>
          </p>
        )}

        {peutEcrire && (
          <div className={styles.deplacements} style={{ marginTop: 8 }}>
            <select
              className={controles.champ}
              value={choisi}
              onChange={(evenement) => definirChoisi(evenement.target.value)}
              aria-label="Agent à assigner"
            >
              <option value="">Assigner un agent…</option>
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
              onClick={() => assigner(choisi)}
            >
              Assigner
            </button>
          </div>
        )}
      </section>

      {/* ─────────────────────── Habilitations ─────────────────────── */}

      {carte.visibilite !== 'public' && (
        <section>
          <p className={controles.etiquette}>Qui a le droit de lire</p>
          <p className={controles.remarque}>
            Cette carte est classée. Seuls les agents nommés ici — ou les
            détenteurs d’un accès dérogatoire — la voient sur le tableau.
            <strong> Assigner quelqu’un ne l’ajoute pas à cette liste.</strong>
          </p>

          {carte.habilitations.length === 0 ? (
            <p className={controles.remarque}>
              Personne n’y est nommément habilité.
            </p>
          ) : (
            <ul className={styles.listeAgents}>
              {carte.habilitations.map((habilitation) => (
                <li key={habilitation.agentId} className={styles.ligneAgent}>
                  <span>{habilitation.libelle}</span>
                  <span className={`${styles.matricule} mono`}>
                    {habilitation.matricule}
                  </span>
                  {peutHabiliter && (
                    <button
                      type="button"
                      className={styles.fleche}
                      onClick={() =>
                        retirerHabilitation.mutate({
                          id: carte.id,
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

          {peutHabiliter && aveugles.length > 0 && (
            <div className={styles.deplacements} style={{ marginTop: 8 }}>
              {aveugles.map((agent) => (
                <button
                  key={agent.agentId}
                  type="button"
                  className={controles.boutonDiscret}
                  onClick={() =>
                    habiliter.mutate({ id: carte.id, agentId: agent.agentId })
                  }
                >
                  Habiliter {agent.libelle}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {(modifier.isError || habiliter.isError) && (
        <p className={controles.erreur} role="alert">
          {modifier.error?.message ?? habiliter.error?.message}
        </p>
      )}

      {peutArchiver && (
        <button
          type="button"
          className={controles.boutonDiscret}
          onClick={() => definirAArchiver(true)}
        >
          Retirer du tableau
        </button>
      )}

      {aArchiver && (
        <Modale
          titre={`Retirer « ${carte.titre} » du tableau ?`}
          libelleConfirmation="Retirer"
          enCours={archiver.isPending}
          onAnnuler={() => definirAArchiver(false)}
          onConfirmer={() =>
            archiver.mutate(
              { id: carte.id, archiver: true },
              {
                onSuccess: () => {
                  definirAArchiver(false);
                  surFermeture();
                },
              },
            )
          }
        >
          <p>
            La carte quitte le tableau et <strong>reste en base</strong> : elle
            raconte une décision de travail, et cela se relit.
          </p>
        </Modale>
      )}
    </Modale>
  );
}
