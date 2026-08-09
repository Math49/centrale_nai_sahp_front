'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { useEntites } from '@/api/entites';
import {
  useChemins,
  useEnregistrerPositions,
  useVoisinage,
  type Chemin,
} from '@/api/graphe';
import { useSession } from '@/auth/use-session';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { Toile } from '@/composants/graphe/toile';
import styles from '@/composants/graphe/graphe.module.css';
import { LegendeFiabilite, PastilleFiabilite } from '@/composants/pastilles';
import { EnteteZone } from '@/composants/zone';

export default function PageGraphe() {
  return (
    <Suspense fallback={<p className={controles.remarque}>Chargement…</p>}>
      <Explorateur />
    </Suspense>
  );
}

function Explorateur() {
  const parametres = useSearchParams();
  const router = useRouter();
  const { agent } = useSession();

  const dossierId = parametres.get('dossier') ?? undefined;

  const [centre, definirCentre] = useState<string | null>(
    parametres.get('depuis'),
  );
  const [profondeur, definirProfondeur] = useState(2);
  const [fiabilite, definirFiabilite] = useState(1);
  const [cible, definirCible] = useState<string | null>(null);

  const voisinage = useVoisinage({
    depuis: centre,
    profondeur,
    fiabilite,
    dossierId,
  });
  const chemins = useChemins(centre, cible, fiabilite);
  const positions = useEnregistrerPositions();

  const peutRepositionner =
    agent?.superAdmin || agent?.permissions.includes('graphe.repositionner');

  return (
    <>
      <EnteteZone
        titre="Graphe"
        sousTitre="Le graphe se construit tout seul à partir des liens saisis. Un chemin qui passe par un lien masqué n’existe pas — la centrale ne dit jamais qu’il existe mais reste hors de portée."
      />

      <div className={styles.barre}>
        <ChoixEntite
          etiquette="Partir de"
          valeurId={centre}
          onChoisir={definirCentre}
        />

        <ChoixEntite
          etiquette="Chercher un chemin vers"
          valeurId={cible}
          onChoisir={definirCible}
        />

        <label className={styles.champ}>
          <span className={controles.etiquette}>Profondeur</span>
          <select
            className={controles.champ}
            value={profondeur}
            onChange={(evenement) =>
              definirProfondeur(Number(evenement.target.value))
            }
          >
            {[1, 2, 3, 4].map((niveau) => (
              <option key={niveau} value={niveau}>
                {niveau} saut{niveau > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.champ}>
          <span className={controles.etiquette}>Fiabilité minimale</span>
          <select
            className={controles.champ}
            value={fiabilite}
            onChange={(evenement) =>
              definirFiabilite(Number(evenement.target.value))
            }
          >
            <option value={1}>Tout</option>
            <option value={2}>À confirmer et mieux</option>
            <option value={3}>Probable et mieux</option>
            <option value={4}>Certain seulement</option>
          </select>
        </label>
      </div>

      {chemins.data && (
        <div className={styles.chemins}>
          <ResultatChemin
            titre="Le plus court"
            chemin={chemins.data.plusCourt}
          />
          {chemins.data.plusSolide ? (
            <ResultatChemin
              titre="Le plus solide"
              chemin={chemins.data.plusSolide}
            />
          ) : (
            chemins.data.plusCourt && (
              <div className={styles.chemin}>
                <p className={styles.cheminTitre}>Le plus solide</p>
                <p className={controles.remarque}>
                  Identique au plus court — un seul est affiché.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {centre === null ? (
        <EtatVide
          titre="Choisir un point de départ."
          explication="L’exploration part d’une entité et s’étend de proche en proche."
        />
      ) : voisinage.isError ? (
        <EtatVide
          titre="Cette entité n’existe pas."
          explication="Elle a peut-être été archivée, ou vous n’y avez pas accès — la centrale ne fait pas la différence, à dessein."
        />
      ) : (
        <>
          <Toile
            noeuds={voisinage.data?.noeuds ?? []}
            aretes={voisinage.data?.aretes ?? []}
            centre={centre}
            surSelection={(id) => router.push(`/entites/${id}`)}
            surExpansion={definirCentre}
            surDeplacement={
              peutRepositionner
                ? (deplacees) =>
                    positions.mutate({ dossierId, positions: deplacees })
                : undefined
            }
          />

          <p className={styles.aide}>
            Cliquer ouvre la fiche · Maj + clic recentre l’exploration sur le
            nœud · Le nombre entre parenthèses est le nombre de voisins qu’il
            reste à déplier
            {peutRepositionner
              ? ' · Déplacer un nœud enregistre la disposition pour tous'
              : ' · Le repositionnement relève d’une permission'}
          </p>

          <LegendeFiabilite />
        </>
      )}
    </>
  );
}

function ResultatChemin({
  titre,
  chemin,
}: {
  titre: string;
  chemin: Chemin | null;
}) {
  return (
    <div className={styles.chemin}>
      <p className={styles.cheminTitre}>
        {titre}
        {chemin && (
          <span className={styles.cheminMesure}>
            {chemin.longueur} saut{chemin.longueur > 1 ? 's' : ''} · maillon le
            plus faible <PastilleFiabilite niveau={chemin.maillonLeFaible} />
          </span>
        )}
      </p>

      {chemin === null ? (
        <p className={controles.remarque}>
          Aucun chemin entre ces deux entités.
        </p>
      ) : (
        <ol className={styles.trajet}>
          {chemin.noeuds.map((noeud, rang) => (
            <li key={noeud.id}>
              <span className={styles.etape}>{noeud.libelle}</span>
              {rang < chemin.aretes.length && (
                <div className={styles.fleche}>
                  ↓ {chemin.aretes[rang].libelle}{' '}
                  <PastilleFiabilite niveau={chemin.aretes[rang].fiabilite} />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ChoixEntite({
  etiquette,
  valeurId,
  onChoisir,
}: {
  etiquette: string;
  valeurId: string | null;
  onChoisir: (id: string | null) => void;
}) {
  const [recherche, definirRecherche] = useState('');
  const resultats = useEntites({ q: recherche });

  const choisie = (resultats.data ?? []).find(
    (entite) => entite.id === valeurId,
  );

  return (
    <div className={styles.champ}>
      <span className={controles.etiquette}>{etiquette}</span>

      <input
        className={controles.champ}
        value={recherche}
        onChange={(evenement) => definirRecherche(evenement.target.value)}
        placeholder={choisie?.libelle ?? 'Rechercher une entité'}
      />

      {recherche.trim().length > 0 && (
        <ul className={styles.suggestions}>
          {(resultats.data ?? []).slice(0, 8).map((entite) => (
            <li key={entite.id}>
              <button
                type="button"
                className={styles.suggestion}
                onClick={() => {
                  onChoisir(entite.id);
                  definirRecherche('');
                }}
              >
                {entite.libelle}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
