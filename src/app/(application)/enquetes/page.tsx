'use client';

import { useMemo, useState } from 'react';

import {
  useCartes,
  useColonnes,
  useCreerCarte,
  useDeplacerCarte,
  type CarteEnquete,
} from '@/api/enquetes';
import { GardePermission } from '@/auth/garde-permission';
import { usePermission } from '@/auth/use-permission';
import { useSession } from '@/auth/use-session';
import { ChampTexte } from '@/composants/champ-texte';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { Modale } from '@/composants/modale';
import { EnteteZone } from '@/composants/zone';
import styles from './enquetes.module.css';
import { PanneauCarte } from './panneau-carte';
import { Tableau } from './tableau';

export default function PageEnquetes() {
  return (
    <GardePermission
      permission="kanban.consulter"
      explication="Le tableau des enquêtes relève du geste « kanban.consulter »."
    >
      <Enquetes />
    </GardePermission>
  );
}

function Enquetes() {
  const { agent } = useSession();
  const colonnes = useColonnes();
  const cartes = useCartes();
  const creer = useCreerCarte();
  const deplacer = useDeplacerCarte();

  const peutEcrire = usePermission('kanban.ecrire');

  const [mesCartes, definirMesCartes] = useState(false);
  const [ouverte, definirOuverte] = useState<CarteEnquete | null>(null);
  const [enCreation, definirEnCreation] = useState<string | null>(null);
  const [titre, definirTitre] = useState('');

  const listeColonnes = useMemo(
    () => [...(colonnes.data ?? [])].sort((a, b) => a.ordre - b.ordre),
    [colonnes.data],
  );

  const listeCartes = useMemo(() => {
    const toutes = cartes.data ?? [];

    if (!mesCartes || !agent) {
      return toutes;
    }

    return toutes.filter((carte) =>
      carte.assignes.some((assigne) => assigne.agentId === agent.id),
    );
  }, [cartes.data, mesCartes, agent]);

  // La carte ouverte doit suivre les écritures : sans cela, le panneau montre
  // encore l'état d'avant l'assignation qu'on vient de poser.
  const carteOuverte = ouverte
    ? ((cartes.data ?? []).find((carte) => carte.id === ouverte.id) ?? null)
    : null;

  return (
    <>
      <EnteteZone
        titre="Enquêtes"
        sousTitre="Où en est le travail. Une carte classée hors de votre portée n’y figure pas — son titre nomme souvent ce qu’un dossier restreint protège."
      />

      <div className={styles.barre}>
        {peutEcrire && listeColonnes.length > 0 && (
          <button
            type="button"
            className={controles.bouton}
            onClick={() => {
              definirTitre('');
              definirEnCreation(listeColonnes[0].id);
            }}
          >
            Nouvelle carte
          </button>
        )}

        <label
          className={controles.groupe}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <input
            type="checkbox"
            checked={mesCartes}
            onChange={(evenement) => definirMesCartes(evenement.target.checked)}
          />
          <span className={controles.etiquette}>mes cartes</span>
        </label>

        <span className={styles.mesure}>
          {listeCartes.length} carte{listeCartes.length > 1 ? 's' : ''}
        </span>
      </div>

      {cartes.isPending ? (
        <p className={controles.remarque}>Chargement du tableau…</p>
      ) : listeColonnes.length === 0 ? (
        <EtatVide
          titre="Aucune colonne n’est définie."
          explication="Le tableau ne sait rien recevoir tant que la centrale n’a pas dit par quels états passe une enquête — cela se règle en administration."
        />
      ) : (
        <Tableau
          colonnes={listeColonnes}
          cartes={listeCartes}
          peutEcrire={peutEcrire}
          surOuverture={definirOuverte}
          surDeplacement={(id, colonneId, rang) =>
            deplacer.mutate({ id, colonneId, rang })
          }
        />
      )}

      <p className={controles.remarque} style={{ marginTop: 12 }}>
        Glisser une carte la déplace ; les flèches font la même chose au clavier
        · Une pastille en pointillé signale un agent assigné qui{' '}
        <strong>ne voit pas</strong> la carte — assigner n’ouvre aucun accès
      </p>

      {carteOuverte && (
        <PanneauCarte
          carte={carteOuverte}
          surFermeture={() => definirOuverte(null)}
        />
      )}

      {enCreation && (
        <Modale
          titre="Nouvelle carte"
          libelleConfirmation="Créer"
          enCours={creer.isPending}
          confirmationBloquee={titre.trim().length === 0}
          onAnnuler={() => definirEnCreation(null)}
          onConfirmer={() =>
            creer.mutate(
              { colonneId: enCreation, titre: titre.trim() },
              { onSuccess: () => definirEnCreation(null) },
            )
          }
        >
          <ChampTexte
            etiquette="Titre"
            valeur={titre}
            onChange={definirTitre}
            indication="ce qu’il y a à faire, en une ligne"
          />

          <label className={controles.groupe}>
            <span className={controles.etiquette}>Colonne</span>
            <select
              className={controles.champ}
              value={enCreation}
              onChange={(evenement) =>
                definirEnCreation(evenement.target.value)
              }
            >
              {listeColonnes.map((colonne) => (
                <option key={colonne.id} value={colonne.id}>
                  {colonne.libelle}
                </option>
              ))}
            </select>
          </label>

          <p className={controles.remarque}>
            Le reste — description, assignés, rattachements, visibilité — se
            règle en ouvrant la carte.
          </p>

          {creer.isError && (
            <p className={controles.erreur}>{creer.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}
