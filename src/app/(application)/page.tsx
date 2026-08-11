'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  useAccueil,
  type Activite,
  type DossierDeLAgent,
  type Signal,
} from '@/api/accueil';
import { useChemins } from '@/api/graphe';
import { useSession } from '@/auth/use-session';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { ChoixEntite, DeuxChemins } from '@/composants/graphe/chemin';
import grapheStyles from '@/composants/graphe/graphe.module.css';
import { PastilleFiabilite, PastilleVisibilite } from '@/composants/pastilles';
import { EnteteZone } from '@/composants/zone';
import styles from './accueil.module.css';

const FAMILLES: Record<Signal['famille'], { etiquette: string; sens: string }> =
  {
    recoupement: {
      etiquette: 'recoupement',
      sens: 'Suivie par plusieurs dossiers que rien ne relie.',
    },
    recurrence: {
      etiquette: 'récurrence',
      sens: 'Relie des données suivies par des dossiers différents.',
    },
    vieillissement: {
      etiquette: 'vieillissement',
      sens: 'À confirmer, et non revu depuis longtemps.',
    },
  };

export default function PageAccueil() {
  const { agent } = useSession();
  const accueil = useAccueil();

  return (
    <>
      <EnteteZone
        titre={`Bonjour, ${agent?.prenom ?? ''}`}
        sousTitre="Ce que la centrale a remarqué depuis votre dernier passage."
      />

      <RechercheDeChemin />

      <div className={styles.grille}>
        <section className={styles.colonne}>
          <h2 className={styles.section}>Signaux</h2>
          <Signaux
            signaux={accueil.data?.signaux ?? []}
            enCours={accueil.isPending}
          />
        </section>

        <section className={styles.colonne}>
          <h2 className={styles.section}>Mes dossiers</h2>
          <MesDossiers dossiers={accueil.data?.mesDossiers ?? []} />
        </section>

        <section className={styles.colonne}>
          <h2 className={styles.section}>Dernière activité</h2>
          <DerniereActivite activites={accueil.data?.derniereActivite ?? []} />
        </section>
      </div>
    </>
  );
}

function RechercheDeChemin() {
  const [de, definirDe] = useState<string | null>(null);
  const [vers, definirVers] = useState<string | null>(null);

  const chemins = useChemins(de, vers, 1);

  return (
    <section className={styles.chemin}>
      <div className={grapheStyles.barre}>
        <ChoixEntite
          etiquette="Chercher un chemin de"
          valeurId={de}
          onChoisir={definirDe}
        />
        <ChoixEntite etiquette="vers" valeurId={vers} onChoisir={definirVers} />
      </div>

      {chemins.data && (
        <DeuxChemins
          plusCourt={chemins.data.plusCourt}
          plusSolide={chemins.data.plusSolide}
        />
      )}
    </section>
  );
}

function Signaux({
  signaux,
  enCours,
}: {
  signaux: Signal[];
  enCours: boolean;
}) {
  if (signaux.length === 0) {
    return (
      <EtatVide
        titre={
          enCours ? 'Lecture des signaux…' : 'Aucun signal pour le moment.'
        }
        explication="Recoupements, récurrences et faits à confirmer non revus apparaîtront ici. La centrale les calcule seule, sur ce que vous pouvez consulter."
        action={
          !enCours && (
            <Link className={controles.boutonDiscret} href="/entites/nouveau">
              Ouvrir une fiche
            </Link>
          )
        }
      />
    );
  }

  return (
    <ul className={styles.liste}>
      {signaux.map((signal) => (
        <li key={signal.id}>
          <Link className={styles.signal} href={`/entites/${signal.entiteId}`}>
            <span
              className={styles.famille}
              data-famille={signal.famille}
              title={FAMILLES[signal.famille].sens}
            >
              {FAMILLES[signal.famille].etiquette}
            </span>
            <span className={styles.resume}>{signal.resume}</span>
            <span className={styles.detail}>{signal.detail}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function MesDossiers({ dossiers }: { dossiers: DossierDeLAgent[] }) {
  if (dossiers.length === 0) {
    return (
      <EtatVide
        titre="Aucun dossier ouvert."
        explication="Un dossier est un périmètre d’enquête ancré sur une donnée pivot. L’ouvrir revient à ouvrir la fiche de cette donnée."
        action={
          <Link className={controles.boutonDiscret} href="/dossiers">
            Voir les dossiers
          </Link>
        }
      />
    );
  }

  return (
    <ul className={styles.liste}>
      {dossiers.map((dossier) => (
        <li key={dossier.id}>
          <Link className={styles.ligne} href={`/dossiers/${dossier.id}`}>
            <span className={styles.resume}>{dossier.nom}</span>
            <span className={styles.detail}>
              {dossier.entitePivotLibelle}
              {dossier.motif === 'habilitation' && ' · habilité'}
            </span>
            <PastilleVisibilite niveau={dossier.visibilite} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DerniereActivite({ activites }: { activites: Activite[] }) {
  if (activites.length === 0) {
    return (
      <EtatVide
        titre="Rien de neuf."
        explication="Les faits saisis récemment par le service s’afficheront ici, avec leur source."
      />
    );
  }

  return (
    <ul className={styles.liste}>
      {activites.map((activite) => (
        <li key={activite.faitId}>
          <Link className={styles.ligne} href={`/entites/${activite.entiteId}`}>
            <span className={styles.resume}>
              {activite.entiteLibelle} — {activite.resume}
            </span>
            <span className={styles.detail}>
              <span className="mono">
                {activite.survenuLe.slice(0, 16).replace('T', ' ')}
              </span>
              {' · '}
              {activite.auteur ?? 'agent supprimé'}
            </span>
            <PastilleFiabilite
              niveau={activite.fiabilite}
              source={activite.source}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
