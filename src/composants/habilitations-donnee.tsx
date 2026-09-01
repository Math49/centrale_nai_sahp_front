'use client';

import { useState } from 'react';

import { useAgents } from '@/api/agents';
import {
  useHabiliterSurEntite,
  useRetirerHabilitationSurEntite,
  type AgentHabilite,
} from '@/api/entites';
import { usePermission } from '@/auth/use-permission';
import controles from './controles.module.css';
import styles from './habilitations-donnee.module.css';

/**
 * Whitelist d'une donnée classée.
 *
 * N'apparaît que si la donnée est restreinte ou privée : sur une fiche
 * publique, une liste d'habilités ne veut rien dire — personne n'a de gardien à
 * franchir, et l'afficher laisserait croire que l'accès se règle ici.
 *
 * Le texte dit ce que l'écran ne montrait pas : **une habilitation sur le
 * dossier n'ouvre pas ses données**. Chaque gardien se franchit pour lui-même,
 * et l'ignorer donne exactement l'impression d'une panne — on habilite, et rien
 * ne se passe.
 */
export function HabilitationsDonnee({
  entiteId,
  visibilite,
  habilitations,
}: {
  entiteId: string;
  visibilite: string;
  habilitations: AgentHabilite[];
}) {
  const peutHabiliter = usePermission('dossier.habiliter');

  const habiliter = useHabiliterSurEntite();
  const retirer = useRetirerHabilitationSurEntite();

  const [choisi, definirChoisi] = useState('');
  const agents = useAgents();

  if (visibilite === 'public') {
    return null;
  }

  const dejaHabilites = habilitations.map(
    (habilitation) => habilitation.agentId,
  );

  const candidats = (agents.data ?? []).filter(
    (agent) => !dejaHabilites.includes(agent.id) && !agent.anonymise,
  );

  return (
    <section className={styles.bloc}>
      <h2 className={styles.titre}>Habilitations sur cette donnée</h2>

      <p className={controles.remarque}>
        Cette donnée est classée : son contenu ne s’ouvre qu’aux agents nommés
        ici, ou à ceux qui disposent d’un accès dérogatoire. Une habilitation
        accordée sur un dossier qui la suit <strong>ne suffit pas</strong> —
        chaque gardien se franchit pour lui-même.
      </p>

      {habilitations.length === 0 ? (
        <p className={controles.remarque}>
          Personne n’y est nommément habilité.
        </p>
      ) : (
        <ul className={styles.liste}>
          {habilitations.map((habilitation) => (
            <li key={habilitation.agentId} className={styles.ligne}>
              <span>{habilitation.libelle}</span>
              <span className={`${styles.matricule} mono`}>
                {habilitation.matricule}
              </span>
              {peutHabiliter && (
                <button
                  type="button"
                  className={styles.retirer}
                  disabled={retirer.isPending}
                  onClick={() =>
                    retirer.mutate({
                      id: entiteId,
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
        <div className={styles.ajout}>
          <select
            className={controles.champ}
            value={choisi}
            onChange={(evenement) => definirChoisi(evenement.target.value)}
            aria-label="Agent à habiliter sur cette donnée"
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
            disabled={choisi === '' || habiliter.isPending}
            onClick={() =>
              habiliter.mutate(
                { id: entiteId, agentId: choisi },
                { onSuccess: () => definirChoisi('') },
              )
            }
          >
            Habiliter
          </button>
        </div>
      )}

      {(habiliter.isError || retirer.isError) && (
        <p className={controles.erreur} role="alert">
          {habiliter.error?.message ?? retirer.error?.message}
        </p>
      )}
    </section>
  );
}
