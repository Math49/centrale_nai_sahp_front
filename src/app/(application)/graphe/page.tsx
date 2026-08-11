'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useDeferredValue, useMemo, useState } from 'react';

import { useEnregistrerPositions, useVueEntiere } from '@/api/graphe';
import { useSession } from '@/auth/use-session';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { COULEURS_TYPE, LEGENDE_TYPES } from '@/composants/graphe/couleurs';
import styles from '@/composants/graphe/graphe.module.css';
import { PanneauDonnee } from '@/composants/graphe/panneau-donnee';
import { donneesVisibles } from '@/composants/graphe/ramification';
import { Toile } from '@/composants/graphe/toile';
import { Icone } from '@/composants/icones';
import { LegendeFiabilite } from '@/composants/pastilles';
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
  const { agent } = useSession();
  const dossierId = parametres.get('dossier') ?? undefined;

  const [fiabilite, definirFiabilite] = useState(1);
  const [recherche, definirRecherche] = useState('');
  const [selection, definirSelection] = useState<string | null>(
    parametres.get('depuis'),
  );
  const [ouverte, definirOuverte] = useState<string | null>(null);
  const [signalOrganisation, definirSignalOrganisation] = useState(0);
  const [organisationEnCours, definirOrganisationEnCours] = useState(false);

  const filtre = useDeferredValue(recherche);

  const vue = useVueEntiere({ fiabilite, dossierId });
  const positions = useEnregistrerPositions();

  const peutRepositionner =
    agent?.superAdmin || agent?.permissions.includes('graphe.repositionner');

  const noeuds = useMemo(() => vue.data?.noeuds ?? [], [vue.data]);
  const aretes = useMemo(() => vue.data?.aretes ?? [], [vue.data]);

  const visibles = useMemo(
    () => donneesVisibles(filtre, noeuds, aretes),
    [filtre, noeuds, aretes],
  );

  const choisi = noeuds.find((noeud) => noeud.id === selection) ?? null;
  const affiches = visibles ? visibles.size : noeuds.length;
  const recurrentes = noeuds.filter((noeud) => noeud.recurrence).length;

  return (
    <>
      <EnteteZone
        titre="Graphe"
        sousTitre="Toute la matière visible, d’un seul tenant. Un chemin qui passe par un lien masqué n’existe pas — la centrale ne dit jamais qu’il existe mais reste hors de portée."
      />

      <div className={styles.barre}>
        <label className={styles.champRecherche}>
          <span className={controles.etiquette}>Filtrer par nom</span>
          <span className={styles.avecIcone}>
            <Icone nom="recherche" taille={15} />
            <input
              className={controles.champ}
              value={recherche}
              onChange={(evenement) => definirRecherche(evenement.target.value)}
              placeholder="Une plaque, un nom, un lieu…"
            />
            {recherche && (
              <button
                type="button"
                className={styles.effacer}
                onClick={() => definirRecherche('')}
                aria-label="Effacer le filtre"
              >
                <Icone nom="fermer" taille={14} />
              </button>
            )}
          </span>
        </label>

        <label className={styles.champCourt}>
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

        <button
          type="button"
          className={controles.boutonDiscret}
          disabled={organisationEnCours || noeuds.length === 0}
          onClick={() => definirSignalOrganisation((tour) => tour + 1)}
          title={
            peutRepositionner
              ? 'Recalcule la disposition et l’enregistre pour tout le service'
              : 'Recalcule la disposition — vos déplacements ne sont pas enregistrés'
          }
        >
          <Icone nom="graphe" taille={15} />
          {organisationEnCours ? 'Organisation…' : 'Réorganiser'}
        </button>

        <div className={styles.mesures}>
          <span className={styles.mesure}>
            <strong>{affiches}</strong>
            {visibles ? ' affichées' : ' données'}
          </span>
          <span className={styles.mesure}>
            <strong>{aretes.length}</strong> liens
          </span>
          {recurrentes > 0 && (
            <span
              className={styles.mesure}
              title="Relient des données de dossiers différents"
            >
              <strong>{recurrentes}</strong> récurrences
            </span>
          )}
        </div>
      </div>

      {visibles?.size === 0 && (
        <p className={controles.remarque}>
          Aucune donnée ne porte ce nom dans ce que vous pouvez consulter.
        </p>
      )}

      {vue.isPending ? (
        <p className={controles.remarque}>Chargement du graphe…</p>
      ) : noeuds.length === 0 ? (
        <EtatVide
          titre="Le graphe est vide."
          explication="Il se construit tout seul à partir des liens saisis : dès qu’une fiche en désigne une autre, l’arête apparaît ici."
        />
      ) : (
        <div className={styles.scene}>
          <Toile
            noeuds={noeuds}
            aretes={aretes}
            selection={selection}
            visibles={visibles}
            surSelection={(id) => definirSelection(id || null)}
            surOuverture={(id) => {
              definirSelection(id);
              definirOuverte(id);
            }}
            surDeplacement={
              peutRepositionner
                ? (deplacees) =>
                    positions.mutate({ dossierId, positions: deplacees })
                : undefined
            }
            signalOrganisation={signalOrganisation}
            surOrganisation={definirOrganisationEnCours}
          />

          {choisi && !ouverte && (
            <div className={styles.etiquetteSelection}>
              <span
                className={styles.pastilleType}
                style={{
                  background:
                    COULEURS_TYPE[choisi.typeCode] ?? 'var(--text-muted)',
                }}
              />
              <span>{choisi.libelle}</span>
              <button
                type="button"
                className={controles.boutonDiscret}
                onClick={() => definirOuverte(choisi.id)}
              >
                Ouvrir
              </button>
            </div>
          )}

          {ouverte && (
            <PanneauDonnee
              id={ouverte}
              surFermeture={() => definirOuverte(null)}
            />
          )}
        </div>
      )}

      <div className={styles.legendes}>
        <div className={styles.legendeTypes}>
          <span className={styles.legendeTitre}>Type de donnée</span>
          {LEGENDE_TYPES.map((type) => (
            <span key={type.code} className={styles.legendeType}>
              <span
                className={styles.pastilleType}
                style={{ background: COULEURS_TYPE[type.code] }}
              />
              {type.libelle}
            </span>
          ))}
        </div>

        <LegendeFiabilite />
      </div>

      <p className={styles.aide}>
        Clic sur un nœud : recentre et met son voisinage au point · Double-clic
        : ouvre la fiche à droite · Glisser : déplace le nœud · Clic dans le
        vide : relâche · Réorganiser recalcule toute la disposition, en écartant
        les grappes pour qu’elles se distinguent · Filtrer par nom montre la
        donnée trouvée et tout ce qui s’y rattache, de proche en proche
        {peutRepositionner
          ? ' · La position déposée est enregistrée pour tout le service'
          : ' · Vos déplacements ne sont pas enregistrés — la disposition partagée relève d’une permission'}
      </p>
    </>
  );
}
