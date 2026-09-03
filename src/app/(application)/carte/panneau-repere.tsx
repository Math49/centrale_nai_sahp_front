'use client';

import { useState } from 'react';

import { useAgents } from '@/api/agents';
import {
  useArchiverRepere,
  useHabiliterSurRepere,
  useModifierRepere,
  useRetirerHabilitationSurRepere,
  useTypesReperes,
  type Repere,
} from '@/api/carte';
import { usePermission } from '@/auth/use-permission';
import { libelleDeLaForme, lireGeometrie } from '@/composants/carte/geometrie';
import controles from '@/composants/controles.module.css';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { Icone } from '@/composants/icones';
import { Modale } from '@/composants/modale';
import { PastilleVisibilite } from '@/composants/pastilles';
import styles from './carte.module.css';
import { FormulaireRepere, type Niveau } from './formulaire-repere';

/**
 * Le repère choisi, ouvert sur la carte.
 *
 * En surimpression plutôt qu'ailleurs : l'agent regarde un plan, et l'envoyer
 * sur une autre page lui ferait perdre sa position et son cadrage — même
 * raison que le panneau du graphe.
 *
 * Il dit **tout** ce que la centrale sait du repère — sa sorte, sa forme, qui
 * l'a posé et quand, comment il est classé, ce qu'on en a noté — et porte les
 * deux seuls gestes qui s'y appliquent : le reprendre, ou le retirer du plan.
 */
export function PanneauRepere({
  repere,
  surFermeture,
}: {
  repere: Repere;
  surFermeture: () => void;
}) {
  const peutAnnoter = usePermission('carte.annoter');
  const peutArchiver = usePermission('carte.archiver');
  const peutHabiliter = usePermission('dossier.habiliter');

  const types = useTypesReperes();
  const modifier = useModifierRepere();
  const archiver = useArchiverRepere();
  const habiliter = useHabiliterSurRepere();
  const retirer = useRetirerHabilitationSurRepere();
  const agents = useAgents();

  const [aReprendre, definirAReprendre] = useState(false);
  const [aArchiver, definirAArchiver] = useState(false);
  const [choisi, definirChoisi] = useState('');

  const geometrie = lireGeometrie(repere.geometrie);

  const type = types.data?.find(
    (candidat) => candidat.id === repere.typeRepereId,
  );

  const dejaHabilites = repere.habilitations.map(
    (habilitation) => habilitation.agentId,
  );

  const candidats = (agents.data ?? []).filter(
    (agent) => !dejaHabilites.includes(agent.id) && !agent.anonymise,
  );

  const archive = repere.etat === 'archive';

  return (
    <aside className={styles.panneau}>
      <div className={styles.entete}>
        <div>
          <h2 className={styles.titre}>
            <span
              className={styles.pastille}
              style={{ background: repere.couleur, marginRight: 8 }}
            >
              <IconeFontAwesome valeur={repere.icone} taille={11} />
            </span>
            {repere.libelle}
          </h2>
          <p className={styles.sousTitre}>
            {repere.typeRepereLibelle} ·{' '}
            {geometrie ? (
              <span className="mono">{libelleDeLaForme(geometrie)}</span>
            ) : (
              'forme illisible'
            )}
          </p>
        </div>

        <button
          type="button"
          className={styles.fermer}
          onClick={surFermeture}
          aria-label="Fermer"
        >
          <Icone nom="fermer" taille={16} />
        </button>
      </div>

      {archive && (
        <div className={styles.jetons}>
          <span className={styles.etatArchive}>Retiré de la carte</span>
        </div>
      )}

      <dl className={styles.fiche}>
        <div>
          <dt>Visibilité</dt>
          {/* Sur le plan, la visibilité se lit au trait — plein, pointillé,
              pointillé serré. Ici elle s'écrit, et pour les trois niveaux :
              « rien affiché » ne se distingue pas d'un oubli. */}
          <dd>
            {repere.visibilite === 'public' ? (
              'Public'
            ) : (
              <PastilleVisibilite niveau={repere.visibilite} />
            )}
          </dd>
        </div>
        <div>
          <dt>Posé par</dt>
          <dd>
            {repere.auteurLibelle} le{' '}
            <span className="mono">{repere.creeLe.slice(0, 10)}</span>
          </dd>
        </div>
        <div>
          <dt>Dernière reprise</dt>
          <dd className="mono">{repere.modifieLe.slice(0, 10)}</dd>
        </div>
        <div>
          <dt>Note</dt>
          {/* Un champ non renseigné reste affiché : l'absence est une
              information, et un panneau qui se raccourcit fait douter. */}
          <dd>{repere.note ?? 'Aucune note.'}</dd>
        </div>
      </dl>

      {repere.visibilite !== 'public' && (
        <section>
          <p className={controles.etiquette}>Habilitations</p>
          <p className={controles.remarque}>
            Ce repère est classé : il <strong>n’apparaît pas</strong> sur la
            carte des agents qui n’y ont pas droit. Les nommer ici est le seul
            moyen de le leur rouvrir.
          </p>

          {repere.habilitations.length === 0 ? (
            <p className={controles.remarque}>
              Personne n’y est nommément habilité.
            </p>
          ) : (
            <ul>
              {repere.habilitations.map((habilitation) => (
                <li key={habilitation.agentId} className={styles.sousTitre}>
                  {habilitation.libelle}{' '}
                  <span className="mono">{habilitation.matricule}</span>
                  {peutHabiliter && (
                    <button
                      type="button"
                      className={styles.fermer}
                      onClick={() =>
                        retirer.mutate({
                          id: repere.id,
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
            <div className={styles.actions}>
              <select
                className={controles.champ}
                value={choisi}
                onChange={(evenement) => definirChoisi(evenement.target.value)}
                aria-label="Agent à habiliter sur ce repère"
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
                onClick={() =>
                  habiliter.mutate(
                    { id: repere.id, agentId: choisi },
                    { onSuccess: () => definirChoisi('') },
                  )
                }
              >
                Habiliter
              </button>
            </div>
          )}
        </section>
      )}

      {(peutAnnoter || peutArchiver) && (
        <div className={styles.actions}>
          {peutAnnoter && !archive && (
            <button
              type="button"
              className={controles.bouton}
              onClick={() => definirAReprendre(true)}
            >
              Modifier
            </button>
          )}

          {peutArchiver && (
            <button
              type="button"
              className={controles.boutonDiscret}
              onClick={() => {
                if (archive) {
                  archiver.mutate({ id: repere.id, archiver: false });
                  return;
                }
                definirAArchiver(true);
              }}
            >
              {archive ? 'Remettre sur la carte' : 'Retirer de la carte'}
            </button>
          )}
        </div>
      )}

      {aReprendre && type && geometrie && (
        <FormulaireRepere
          titre={`Modifier « ${repere.libelle} »`}
          type={type}
          geometrie={geometrie}
          valeursInitiales={{
            libelle: repere.libelle,
            note: repere.note ?? '',
            couleur: repere.couleur,
            opacite: repere.opacite ?? undefined,
            visibilite: repere.visibilite as Niveau,
          }}
          enCours={modifier.isPending}
          erreur={modifier.isError ? modifier.error.message : null}
          onAnnuler={() => definirAReprendre(false)}
          onEnregistrer={(valeurs) =>
            modifier.mutate(
              {
                id: repere.id,
                libelle: valeurs.libelle,
                note: valeurs.note,
                couleur: valeurs.couleur,
                opacite: valeurs.opacite,
                visibilite: valeurs.visibilite,
              },
              { onSuccess: () => definirAReprendre(false) },
            )
          }
        />
      )}

      {aArchiver && (
        <Modale
          titre={`Retirer « ${repere.libelle} » de la carte ?`}
          libelleConfirmation="Retirer"
          enCours={archiver.isPending}
          onAnnuler={() => definirAArchiver(false)}
          onConfirmer={() =>
            archiver.mutate(
              { id: repere.id, archiver: true },
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
            Le repère quitte le plan et <strong>reste en base</strong> : ce
            qu’on a cru savoir d’un terrain fait partie de l’enquête, même quand
            on cesse d’y croire. Il se retrouve en cochant « archives » dans les
            filtres avancés, et s’y remet d’un bouton.
          </p>
          {archiver.isError && (
            <p className={controles.erreur}>{archiver.error.message}</p>
          )}
        </Modale>
      )}
    </aside>
  );
}
