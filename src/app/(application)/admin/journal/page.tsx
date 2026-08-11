'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  useJournalAudit,
  useJournalConsultations,
  type EntreeAudit,
  type EntreeConsultation,
} from '@/api/journal';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { EnteteZone } from '@/composants/zone';
import styles from '../administration.module.css';

type Onglet = 'consultations' | 'audit';

function Horodatage({ valeur }: { valeur: string }) {
  return <span className="mono">{valeur.slice(0, 16).replace('T', ' ')}</span>;
}

export default function PageJournal() {
  const [onglet, definirOnglet] = useState<Onglet>('consultations');

  return (
    <>
      <EnteteZone
        titre="Journaux"
        sousTitre="Toute lecture de fiche et toute écriture y laissent une trace. Les libellés sont recalculés à la lecture : une trace qui aurait figé un nom survivrait à l’anonymisation du compte."
      />

      {}
      <div className={styles.formulaireEnLigne}>
        {(['consultations', 'audit'] as const).map((nom) => (
          <button
            key={nom}
            type="button"
            className={styles.ligneChoisissable}
            aria-pressed={onglet === nom}
            onClick={() => definirOnglet(nom)}
          >
            {nom === 'consultations' ? 'Consultations' : 'Écritures'}
          </button>
        ))}
      </div>

      {onglet === 'consultations' ? <Consultations /> : <Audit />}
    </>
  );
}

function Consultations() {
  const [superAdmin, definirSuperAdmin] = useState(false);
  const [derogation, definirDerogation] = useState(false);

  const entrees = useJournalConsultations({ superAdmin, derogation });

  return (
    <div className={styles.panneau}>
      <div className={styles.formulaireEnLigne}>
        <Bascule
          libelle="Consultations du super-admin seulement"
          actif={superAdmin}
          onBasculer={definirSuperAdmin}
        />
        <Bascule
          libelle="Accès dérogatoires seulement"
          actif={derogation}
          onBasculer={definirDerogation}
        />
      </div>

      {entrees.data && entrees.data.length === 0 ? (
        <EtatVide
          titre="Aucune consultation à afficher."
          explication="Chaque ouverture de fiche ou de dossier viendra s’inscrire ici."
        />
      ) : (
        <table className={styles.tableau}>
          <thead>
            <tr>
              <th>Quand</th>
              <th>Qui</th>
              <th>Quoi</th>
              <th>Circonstance</th>
            </tr>
          </thead>
          <tbody>
            {(entrees.data ?? []).map((entree) => (
              <LigneConsultation key={entree.id} entree={entree} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function LigneConsultation({ entree }: { entree: EntreeConsultation }) {
  const chemin =
    entree.nature === 'dossier'
      ? `/dossiers/${entree.objetId}`
      : `/entites/${entree.objetId}`;

  return (
    <tr>
      <td>
        <Horodatage valeur={entree.consulteLe} />
      </td>
      <td>{entree.agentLibelle}</td>
      <td>
        {entree.objetLibelle ? (
          <Link href={chemin}>{entree.objetLibelle}</Link>
        ) : (
          <span className={styles.domaine}>objet non consultable</span>
        )}
      </td>
      <td>
        <span className={styles.marqueurs}>
          {entree.superAdmin && (
            <span className={styles.marqueur}>super-admin</span>
          )}
          {entree.derogation && (
            <span className={styles.marqueur}>dérogation</span>
          )}
          {!entree.superAdmin && !entree.derogation && (
            <span className={styles.domaine}>ordinaire</span>
          )}
        </span>
      </td>
    </tr>
  );
}

function Audit() {
  const [action, definirAction] = useState('');
  const entrees = useJournalAudit({ action });

  return (
    <div className={styles.panneau}>
      <label className={controles.groupe}>
        <span className={controles.etiquette}>Filtrer par geste</span>
        <input
          className={controles.champ}
          value={action}
          onChange={(evenement) => definirAction(evenement.target.value)}
          placeholder="entite.fusionner, fait.infirmer…"
        />
      </label>

      {entrees.data && entrees.data.length === 0 ? (
        <EtatVide
          titre="Aucune écriture ne correspond."
          explication="Toute création, modification, infirmation ou fusion s’inscrit ici."
        />
      ) : (
        <table className={styles.tableau}>
          <thead>
            <tr>
              <th>Quand</th>
              <th>Qui</th>
              <th>Geste</th>
              <th>Sur quoi</th>
            </tr>
          </thead>
          <tbody>
            {(entrees.data ?? []).map((entree) => (
              <LigneAudit key={entree.id} entree={entree} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function LigneAudit({ entree }: { entree: EntreeAudit }) {
  const [deploye, definirDeploye] = useState(false);
  const aUnDetail = entree.avant !== undefined || entree.apres !== undefined;

  return (
    <>
      <tr>
        <td>
          <Horodatage valeur={entree.effectueLe} />
        </td>
        <td>{entree.agentLibelle}</td>
        <td>
          <span className="mono">{entree.action}</span>
        </td>
        <td>
          {entree.cibleLibelle ?? (
            <span className={styles.domaine}>{entree.cibleTable}</span>
          )}
          {aUnDetail && (
            <button
              type="button"
              className={styles.retirer}
              style={{ marginLeft: 8 }}
              onClick={() => definirDeploye((ouvert) => !ouvert)}
            >
              {deploye ? 'replier' : 'détail'}
            </button>
          )}
        </td>
      </tr>

      {deploye && (
        <tr>
          <td colSpan={4}>
            <pre className={styles.apercu}>
              {JSON.stringify(
                { avant: entree.avant, apres: entree.apres },
                null,
                2,
              )}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}

function Bascule({
  libelle,
  actif,
  onBasculer,
}: {
  libelle: string;
  actif: boolean;
  onBasculer: (valeur: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={styles.ligneChoisissable}
      aria-pressed={actif}
      onClick={() => onBasculer(!actif)}
    >
      {libelle}
    </button>
  );
}
