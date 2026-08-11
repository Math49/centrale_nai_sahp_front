'use client';

import { useMemo, useState } from 'react';

import {
  useAgents,
  useAnonymiserAgent,
  useCreerAgent,
  useModifierAgent,
  useReinitialiserMotDePasse,
  type AgentResume,
} from '@/api/agents';
import { useRoles, type Role } from '@/api/roles';
import { GardePermission } from '@/auth/garde-permission';
import { useSession } from '@/auth/use-session';
import { ChampTexte } from '@/composants/champ-texte';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';
import propres from './comptes.module.css';

export default function PageAgents() {
  return (
    <GardePermission
      permission="agent.gerer"
      explication="La gestion des comptes relève de la permission « agent.gerer ». Elle s’accorde par grade, dans la rubrique Rôles et permissions."
    >
      <Comptes />
    </GardePermission>
  );
}

/** Ce qui n'est montré qu'une fois : un mot de passe provisoire et son porteur. */
interface Secret {
  agent: AgentResume;
  motDePasse: string;
  /** Vrai après une réinitialisation, faux après une ouverture de compte. */
  reinitialise: boolean;
}

function Comptes() {
  const { agent: moi } = useSession();

  const [avecAnonymises, definirAvecAnonymises] = useState(false);
  const [recherche, definirRecherche] = useState('');
  const [choisiId, definirChoisiId] = useState<string | null>(null);
  const [enCreation, definirEnCreation] = useState(false);
  const [secret, definirSecret] = useState<Secret | null>(null);

  const comptes = useAgents(avecAnonymises);
  const roles = useRoles();

  const filtres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    const tous = comptes.data ?? [];

    if (!terme) {
      return tous;
    }

    return tous.filter((compte) =>
      [compte.libelle, compte.matricule, compte.roleLibelle]
        .join(' ')
        .toLowerCase()
        .includes(terme),
    );
  }, [comptes.data, recherche]);

  const choisi = (comptes.data ?? []).find((compte) => compte.id === choisiId);

  return (
    <>
      <EnteteZone
        titre="Comptes agents"
        sousTitre="Il n’existe pas d’inscription libre : un compte est ouvert par quelqu’un, et part en changement de mot de passe imposé. Aucun n’est jamais supprimé — l’anonymisation est la seule forme de retrait."
      />

      <div className={styles.atelier}>
        <div className={styles.colonne}>
          <div className={styles.panneau}>
            <p className={styles.section}>Effectif</p>

            <div className={propres.filtres}>
              <input
                className={controles.champ}
                value={recherche}
                onChange={(evenement) =>
                  definirRecherche(evenement.target.value)
                }
                placeholder="Nom, matricule ou grade"
                aria-label="Filtrer les comptes"
              />

              <label className={propres.bascule}>
                <input
                  type="checkbox"
                  checked={avecAnonymises}
                  onChange={(evenement) =>
                    definirAvecAnonymises(evenement.target.checked)
                  }
                />
                afficher les comptes anonymisés
              </label>
            </div>

            {comptes.isError ? (
              <p className={controles.erreur}>{comptes.error.message}</p>
            ) : filtres.length === 0 ? (
              <p className={controles.remarque}>
                {recherche
                  ? 'Aucun compte ne porte ce nom.'
                  : 'Aucun compte à afficher.'}
              </p>
            ) : (
              <div className={propres.liste}>
                {filtres.map((compte) => (
                  <button
                    key={compte.id}
                    type="button"
                    className={`${styles.ligneChoisissable} ${
                      compte.actif && !compte.anonymise ? '' : propres.eteinte
                    }`}
                    aria-pressed={compte.id === choisiId}
                    onClick={() => {
                      definirChoisiId(compte.id);
                      definirEnCreation(false);
                    }}
                  >
                    <span className={propres.ligne}>
                      <span className={propres.identite}>
                        <span className={propres.nom}>{compte.libelle}</span>
                        <span className={propres.grade}>
                          {compte.roleLibelle}
                          {compte.superAdmin && ' · super-admin'}
                        </span>
                      </span>
                      <span className={`${propres.matricule} mono`}>
                        {compte.anonymise ? '—' : compte.matricule}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              className={controles.bouton}
              onClick={() => {
                definirEnCreation(true);
                definirChoisiId(null);
              }}
            >
              Ouvrir un compte
            </button>
          </div>
        </div>

        {enCreation ? (
          <Ouverture
            roles={roles.data ?? []}
            surAnnulation={() => definirEnCreation(false)}
            surOuverture={(nouveau, motDePasse) => {
              definirEnCreation(false);
              definirChoisiId(nouveau.id);
              definirSecret({
                agent: nouveau,
                motDePasse,
                reinitialise: false,
              });
            }}
          />
        ) : choisi ? (
          <FicheCompte
            key={choisi.id}
            compte={choisi}
            roles={roles.data ?? []}
            estMoi={choisi.id === moi?.id}
            peutAnonymiser={
              moi?.superAdmin === true ||
              moi?.permissions.includes('agent.anonymiser') === true
            }
            surMotDePasse={(motDePasse) =>
              definirSecret({
                agent: choisi,
                motDePasse,
                reinitialise: true,
              })
            }
          />
        ) : (
          <div className={styles.panneau}>
            <EtatVide
              titre="Aucun compte sélectionné."
              explication="Choisissez un compte dans l’effectif, ou ouvrez-en un nouveau."
            />
          </div>
        )}
      </div>

      {secret && (
        <MotDePasseProvisoire
          secret={secret}
          surFermeture={() => definirSecret(null)}
        />
      )}
    </>
  );
}

/**
 * Ouverture d'un compte.
 *
 * L'administrateur ne choisit pas le mot de passe : l'API en engendre un
 * provisoire, montré une seule fois, et le compte part en changement imposé.
 * Laisser l'administrateur le saisir lui donnerait une connaissance durable
 * d'un secret qui n'appartient qu'à l'agent.
 */
function Ouverture({
  roles,
  surAnnulation,
  surOuverture,
}: {
  roles: Role[];
  surAnnulation: () => void;
  surOuverture: (agent: AgentResume, motDePasse: string) => void;
}) {
  const creer = useCreerAgent();

  const [matricule, definirMatricule] = useState('');
  const [prenom, definirPrenom] = useState('');
  const [nom, definirNom] = useState('');
  const [roleId, definirRoleId] = useState('');
  const [superAdmin, definirSuperAdmin] = useState(false);
  const [aConfirmer, definirAConfirmer] = useState(false);

  const complet =
    matricule.trim() !== '' &&
    prenom.trim() !== '' &&
    nom.trim() !== '' &&
    roleId !== '';

  const grade = roles.find((role) => role.id === roleId);

  return (
    <>
      <form
        className={styles.panneau}
        onSubmit={(evenement) => {
          evenement.preventDefault();
          definirAConfirmer(true);
        }}
      >
        <p className={styles.section}>Nouveau compte</p>

        <div className={styles.grilleChamps}>
          <ChampTexte
            etiquette="Matricule"
            mono
            valeur={matricule}
            onChange={definirMatricule}
            indication="lettres, chiffres et tirets"
          />
          <ChampTexte
            etiquette="Prénom"
            valeur={prenom}
            onChange={definirPrenom}
          />
          <ChampTexte etiquette="Nom" valeur={nom} onChange={definirNom} />

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Grade</span>
            <select
              className={controles.champ}
              value={roleId}
              onChange={(evenement) => definirRoleId(evenement.target.value)}
              required
            >
              <option value="">—</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.libelle}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={propres.bascule}>
          <input
            type="checkbox"
            checked={superAdmin}
            onChange={(evenement) =>
              definirSuperAdmin(evenement.target.checked)
            }
          />
          super-admin
        </label>

        <p className={controles.remarque}>
          Le super-admin est un attribut du compte, indépendant du grade : il
          ouvre la configuration du modèle métier — types de données, champs,
          types de liens — qui ne se délègue par aucune permission.
        </p>

        <p className={styles.apercu}>
          {grade
            ? `${prenom || '…'} ${nom || '…'} ouvrira sa session avec le matricule ${
                matricule || '…'
              }, au grade ${grade.libelle}, et devra changer son mot de passe à la première connexion.`
            : 'Choisir un grade pour voir ce que ce compte pourra faire.'}
        </p>

        {creer.isError && (
          <p className={controles.erreur} role="alert">
            {creer.error.message}
          </p>
        )}

        <div className={propres.actions}>
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={surAnnulation}
          >
            Annuler
          </button>
          <button
            type="submit"
            className={controles.bouton}
            disabled={!complet || creer.isPending}
          >
            Ouvrir le compte
          </button>
        </div>
      </form>

      {aConfirmer && (
        <Modale
          titre="Ouvrir ce compte ?"
          libelleConfirmation="Ouvrir"
          enCours={creer.isPending}
          onAnnuler={() => definirAConfirmer(false)}
          onConfirmer={() =>
            creer.mutate(
              {
                matricule: matricule.trim(),
                prenom: prenom.trim(),
                nom: nom.trim(),
                roleId,
                superAdmin,
              },
              {
                onSuccess: (reponse) => {
                  definirAConfirmer(false);
                  surOuverture(
                    reponse.agent,
                    reponse.motDePasseProvisoire ?? '',
                  );
                },
              },
            )
          }
        >
          <p>
            <strong>
              {prenom} {nom}
            </strong>{' '}
            — <span className="mono">{matricule}</span>, {grade?.libelle}
            {superAdmin && ', super-admin'}.
          </p>
          <p className={controles.remarque}>
            Un mot de passe provisoire sera engendré et affiché{' '}
            <strong>une seule fois</strong> : il n’est stocké nulle part en
            clair et ne pourra pas être relu.
          </p>
          {creer.isError && (
            <p className={controles.erreur}>{creer.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}

/** Fiche d'un compte existant — état, grade, et les deux gestes lourds. */
function FicheCompte({
  compte,
  roles,
  estMoi,
  peutAnonymiser,
  surMotDePasse,
}: {
  compte: AgentResume;
  roles: Role[];
  estMoi: boolean;
  peutAnonymiser: boolean;
  surMotDePasse: (motDePasse: string) => void;
}) {
  const modifier = useModifierAgent();
  const reinitialiser = useReinitialiserMotDePasse();
  const anonymiser = useAnonymiserAgent();

  const [prenom, definirPrenom] = useState(compte.prenom);
  const [nom, definirNom] = useState(compte.nom);
  const [roleId, definirRoleId] = useState(compte.roleId);
  const [actif, definirActif] = useState(compte.actif);
  const [superAdmin, definirSuperAdmin] = useState(compte.superAdmin);

  const [aEnregistrer, definirAEnregistrer] = useState(false);
  const [aReinitialiser, definirAReinitialiser] = useState(false);
  const [aAnonymiser, definirAAnonymiser] = useState(false);
  const [saisieMatricule, definirSaisieMatricule] = useState('');

  // On n'envoie que ce qui a bougé : la modale récapitule alors exactement ce
  // qui va partir, et non l'état complet du formulaire.
  const changements: string[] = [];
  if (prenom !== compte.prenom) changements.push(`prénom → ${prenom}`);
  if (nom !== compte.nom) changements.push(`nom → ${nom}`);
  if (roleId !== compte.roleId) {
    changements.push(
      `grade → ${roles.find((role) => role.id === roleId)?.libelle ?? '—'}`,
    );
  }
  if (actif !== compte.actif) {
    changements.push(actif ? 'compte réactivé' : 'compte fermé');
  }
  if (superAdmin !== compte.superAdmin) {
    changements.push(superAdmin ? 'super-admin accordé' : 'super-admin retiré');
  }

  if (compte.anonymise) {
    return (
      <div className={styles.panneau}>
        <div className={propres.entete}>
          <h2 className={propres.titreCompte}>{compte.libelle}</h2>
          <span className={styles.marqueur}>anonymisé</span>
        </div>
        <p className={controles.remarque}>
          Ce compte a été anonymisé
          {compte.anonymiseLe && (
            <>
              {' '}
              le <span className="mono">{compte.anonymiseLe.slice(0, 10)}</span>
            </>
          )}
          . Les données personnelles sont effacées ; l’enregistrement demeure
          pour que les traces qui le désignent continuent de pointer quelque
          part. Rien n’est réversible ici.
        </p>
      </div>
    );
  }

  return (
    <>
      <form
        className={styles.panneau}
        onSubmit={(evenement) => {
          evenement.preventDefault();
          definirAEnregistrer(true);
        }}
      >
        <div className={propres.entete}>
          <h2 className={propres.titreCompte}>
            {compte.prenom} {compte.nom}
          </h2>
          <span className={propres.etats}>
            <span className={`${styles.marqueur} mono`}>
              {compte.matricule}
            </span>
            {!compte.actif && <span className={styles.marqueur}>fermé</span>}
            {compte.doitChangerMdp && (
              <span className={styles.marqueur}>changement imposé</span>
            )}
            {compte.superAdmin && (
              <span className={styles.marqueur}>super-admin</span>
            )}
          </span>
        </div>

        <p className={controles.remarque}>
          Ouvert le <span className="mono">{compte.creeLe.slice(0, 10)}</span>.
          Le matricule ne se modifie pas : il identifie le compte dans les
          traces.
        </p>

        <div className={styles.grilleChamps}>
          <ChampTexte
            etiquette="Prénom"
            valeur={prenom}
            onChange={definirPrenom}
          />
          <ChampTexte etiquette="Nom" valeur={nom} onChange={definirNom} />

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Grade</span>
            <select
              className={controles.champ}
              value={roleId}
              onChange={(evenement) => definirRoleId(evenement.target.value)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.libelle}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={propres.bascule}>
          <input
            type="checkbox"
            checked={actif}
            onChange={(evenement) => definirActif(evenement.target.checked)}
          />
          compte actif
        </label>

        <label className={propres.bascule}>
          <input
            type="checkbox"
            checked={superAdmin}
            onChange={(evenement) =>
              definirSuperAdmin(evenement.target.checked)
            }
          />
          super-admin
        </label>

        {estMoi && (
          <p className={controles.remarque}>
            Ce compte est le vôtre. Fermer votre propre compte ou vous retirer
            l’attribut super-admin vous privera de cet écran.
          </p>
        )}

        {modifier.isError && (
          <p className={controles.erreur} role="alert">
            {modifier.error.message}
          </p>
        )}

        <div className={propres.actions}>
          <button
            type="submit"
            className={controles.bouton}
            disabled={changements.length === 0 || modifier.isPending}
          >
            Enregistrer
          </button>

          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => definirAReinitialiser(true)}
          >
            Réinitialiser le mot de passe
          </button>

          {peutAnonymiser && (
            <button
              type="button"
              className={`${styles.retirer} ${propres.dangereux}`}
              onClick={() => {
                definirSaisieMatricule('');
                definirAAnonymiser(true);
              }}
            >
              Anonymiser
            </button>
          )}
        </div>
      </form>

      {aEnregistrer && (
        <Modale
          titre="Enregistrer ces modifications ?"
          enCours={modifier.isPending}
          onAnnuler={() => definirAEnregistrer(false)}
          onConfirmer={() =>
            modifier.mutate(
              {
                id: compte.id,
                ...(prenom !== compte.prenom && { prenom }),
                ...(nom !== compte.nom && { nom }),
                ...(roleId !== compte.roleId && { roleId }),
                ...(actif !== compte.actif && { actif }),
                ...(superAdmin !== compte.superAdmin && { superAdmin }),
              },
              { onSuccess: () => definirAEnregistrer(false) },
            )
          }
        >
          <ul>
            {changements.map((changement) => (
              <li key={changement}>{changement}</li>
            ))}
          </ul>
          {!actif && compte.actif && (
            <p className={controles.remarque}>
              Un compte fermé ne peut plus ouvrir de session. Ses traces, elles,
              restent lisibles.
            </p>
          )}
          {modifier.isError && (
            <p className={controles.erreur}>{modifier.error.message}</p>
          )}
        </Modale>
      )}

      {aReinitialiser && (
        <Modale
          titre="Réinitialiser le mot de passe ?"
          libelleConfirmation="Réinitialiser"
          enCours={reinitialiser.isPending}
          onAnnuler={() => definirAReinitialiser(false)}
          onConfirmer={() =>
            reinitialiser.mutate(compte.id, {
              onSuccess: (reponse) => {
                definirAReinitialiser(false);
                surMotDePasse(reponse.motDePasseProvisoire ?? '');
              },
            })
          }
        >
          <p>
            <strong>{compte.libelle}</strong> sera déconnecté partout, et devra
            changer son mot de passe à sa prochaine connexion.
          </p>
          <p className={controles.remarque}>
            Le mot de passe provisoire s’affichera{' '}
            <strong>une seule fois</strong>.
          </p>
          {reinitialiser.isError && (
            <p className={controles.erreur}>{reinitialiser.error.message}</p>
          )}
        </Modale>
      )}

      {aAnonymiser && (
        <Modale
          titre={`Anonymiser ${compte.libelle} ?`}
          libelleConfirmation="Anonymiser définitivement"
          irreversible
          enCours={anonymiser.isPending}
          confirmationBloquee={saisieMatricule.trim() !== compte.matricule}
          onAnnuler={() => definirAAnonymiser(false)}
          onConfirmer={() =>
            anonymiser.mutate(compte.id, {
              onSuccess: () => definirAAnonymiser(false),
            })
          }
        >
          <p>
            L’anonymisation est la <strong>seule forme de retrait</strong> d’un
            compte. Elle efface le prénom, le nom et le matricule, conserve
            l’enregistrement et révoque les jetons. Les traces qui désignent ce
            compte continueront de pointer vers lui, sans jamais le nommer.
          </p>

          {estMoi && (
            <p className={controles.erreur}>
              C’est votre propre compte : vous perdrez votre session dans
              l’instant.
            </p>
          )}

          <label className={propres.confirmationSaisie}>
            <span className={controles.etiquette}>
              Saisir <span className="mono">{compte.matricule}</span> pour
              confirmer
            </span>
            <input
              className={controles.champMono}
              value={saisieMatricule}
              onChange={(evenement) =>
                definirSaisieMatricule(evenement.target.value)
              }
              autoComplete="off"
            />
          </label>

          {anonymiser.isError && (
            <p className={controles.erreur}>{anonymiser.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}

/**
 * Le mot de passe provisoire, montré une seule fois.
 *
 * Fermé par un bouton unique et explicite : une modale qu'on referme d'un clic
 * dans le vide ferait perdre un secret irrécupérable. D'où `sansAnnulation`,
 * qui retire le voile, l'échappement et le bouton discret, et un libellé de
 * confirmation qui engage.
 */
function MotDePasseProvisoire({
  secret,
  surFermeture,
}: {
  secret: Secret;
  surFermeture: () => void;
}) {
  const [copie, definirCopie] = useState(false);

  return (
    <Modale
      titre={
        secret.reinitialise ? 'Mot de passe réinitialisé' : 'Compte ouvert'
      }
      libelleConfirmation="J’ai noté ce mot de passe"
      sansAnnulation
      onAnnuler={surFermeture}
      onConfirmer={surFermeture}
    >
      <p>
        <strong>{secret.agent.libelle}</strong> —{' '}
        <span className="mono">{secret.agent.matricule}</span>
      </p>

      <div className={propres.secret}>
        <span className={propres.secretValeur}>{secret.motDePasse}</span>
        <button
          type="button"
          className={controles.boutonDiscret}
          onClick={() => {
            void navigator.clipboard?.writeText(secret.motDePasse);
            definirCopie(true);
          }}
        >
          {copie ? 'Copié' : 'Copier'}
        </button>
      </div>

      <p className={controles.remarque}>
        Transmettez-le à l’agent par un canal qui n’est pas celui-ci. Il ne sera
        plus affiché : il n’est stocké nulle part en clair, et le compte est en
        changement de mot de passe imposé jusqu’à ce que l’agent en choisisse
        un.
      </p>
    </Modale>
  );
}
