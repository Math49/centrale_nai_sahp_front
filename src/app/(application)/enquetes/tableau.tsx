'use client';

import { useState } from 'react';

import type { CarteEnquete, ColonneKanban } from '@/api/enquetes';
import styles from './enquetes.module.css';

/**
 * Le tableau, et son glisser-déposer entre colonnes.
 *
 * `ListeReordonnable` ne convenait pas : elle ne connaît qu'une liste, et son
 * `onOrdonner(ids)` ne transporte pas de colonne. On étend son motif plutôt que
 * d'ajouter une dépendance — événements HTML5 natifs, attributs `data-` pour le
 * retour visuel, et **le repli clavier des flèches conservé** : jsdom ne simule
 * pas le glisser-déposer natif, et c'est lui que les tests exercent.
 *
 * La carte saisie vit au niveau du tableau, pas de la colonne : entre deux
 * colonnes React distinctes, un état local serait invisible de l'autre côté.
 */
export function Tableau({
  colonnes,
  cartes,
  peutEcrire,
  surOuverture,
  surDeplacement,
}: {
  colonnes: ColonneKanban[];
  cartes: CarteEnquete[];
  peutEcrire: boolean;
  surOuverture: (carte: CarteEnquete) => void;
  surDeplacement: (id: string, colonneId: string, rang: number) => void;
}) {
  const [saisie, definirSaisie] = useState<string | null>(null);
  const [cible, definirCible] = useState<string | null>(null);

  const cartesDe = (colonneId: string) =>
    cartes
      .filter((carte) => carte.colonneId === colonneId)
      .sort((a, b) => a.rang - b.rang);

  const deposer = (colonneId: string, rang: number) => {
    if (saisie) {
      surDeplacement(saisie, colonneId, rang);
    }

    definirSaisie(null);
    definirCible(null);
  };

  return (
    <div className={styles.tableau}>
      {colonnes.map((colonne) => {
        const contenu = cartesDe(colonne.id);

        return (
          <section
            key={colonne.id}
            className={styles.colonne}
            data-cible={cible === colonne.id}
            onDragOver={(evenement) => {
              if (!peutEcrire || !saisie) {
                return;
              }
              evenement.preventDefault();
              definirCible(colonne.id);
            }}
            onDragLeave={() =>
              definirCible((actuelle) =>
                actuelle === colonne.id ? null : actuelle,
              )
            }
            onDrop={(evenement) => {
              evenement.preventDefault();
              deposer(colonne.id, contenu.length);
            }}
          >
            <header className={styles.enteteColonne}>
              <span className={styles.titreColonne}>{colonne.libelle}</span>
              <span className={styles.compteur}>{contenu.length}</span>
            </header>

            {contenu.length === 0 ? (
              <p className={styles.videColonne}>
                {saisie ? 'Déposer ici' : 'Rien ici.'}
              </p>
            ) : (
              contenu.map((carte, rang) => (
                <Carte
                  key={carte.id}
                  carte={carte}
                  rang={rang}
                  dernier={rang === contenu.length - 1}
                  colonnes={colonnes}
                  peutEcrire={peutEcrire}
                  saisie={saisie === carte.id}
                  surSaisie={definirSaisie}
                  surDepot={(rangCible) => deposer(colonne.id, rangCible)}
                  surOuverture={() => surOuverture(carte)}
                  surDeplacement={surDeplacement}
                />
              ))
            )}
          </section>
        );
      })}
    </div>
  );
}

function Carte({
  carte,
  rang,
  dernier,
  colonnes,
  peutEcrire,
  saisie,
  surSaisie,
  surDepot,
  surOuverture,
  surDeplacement,
}: {
  carte: CarteEnquete;
  rang: number;
  dernier: boolean;
  colonnes: ColonneKanban[];
  peutEcrire: boolean;
  saisie: boolean;
  surSaisie: (id: string | null) => void;
  surDepot: (rang: number) => void;
  surOuverture: () => void;
  surDeplacement: (id: string, colonneId: string, rang: number) => void;
}) {
  const position = colonnes.findIndex(
    (colonne) => colonne.id === carte.colonneId,
  );

  return (
    <div
      className={styles.carte}
      data-saisie={saisie}
      draggable={peutEcrire}
      onDragStart={() => surSaisie(carte.id)}
      onDragEnd={() => surSaisie(null)}
      onDragOver={(evenement) => {
        if (peutEcrire) {
          evenement.preventDefault();
        }
      }}
      onDrop={(evenement) => {
        evenement.preventDefault();
        evenement.stopPropagation();
        surDepot(rang);
      }}
    >
      <button
        type="button"
        className={styles.titreCarte}
        onClick={surOuverture}
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          textAlign: 'left',
          cursor: 'pointer',
          color: 'inherit',
          font: 'inherit',
        }}
      >
        {carte.titre}
      </button>

      <div className={styles.pied}>
        {carte.dossier && (
          <span className={styles.rattachement}>
            dossier : {carte.dossier.libelle ?? 'objet non consultable'}
          </span>
        )}
        {carte.echeance && (
          <span className={`${styles.echeance} mono`}>{carte.echeance}</span>
        )}

        {carte.assignes.length > 0 && (
          <span className={styles.assignes}>
            {carte.assignes.map((agent) => (
              <span
                key={agent.agentId}
                className={styles.pastilleAgent}
                data-aveugle={!agent.peutLire}
                title={
                  agent.peutLire
                    ? `${agent.libelle} · ${agent.matricule}`
                    : `${agent.libelle} · ${agent.matricule} — assigné, mais ne peut pas lire cette carte`
                }
              >
                {agent.initiales}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Repli clavier du glissement : jsdom ne simule pas le DnD natif, et
          tout le monde ne glisse pas à la souris. */}
      {peutEcrire && colonnes.length > 1 && (
        <div className={styles.deplacements}>
          <button
            type="button"
            className={styles.fleche}
            disabled={position <= 0}
            aria-label={`Déplacer « ${carte.titre} » vers la colonne précédente`}
            onClick={() =>
              surDeplacement(carte.id, colonnes[position - 1].id, 0)
            }
          >
            ←
          </button>
          <button
            type="button"
            className={styles.fleche}
            disabled={rang === 0}
            aria-label={`Monter « ${carte.titre} »`}
            onClick={() => surDeplacement(carte.id, carte.colonneId, rang - 1)}
          >
            ↑
          </button>
          <button
            type="button"
            className={styles.fleche}
            disabled={dernier}
            aria-label={`Descendre « ${carte.titre} »`}
            onClick={() => surDeplacement(carte.id, carte.colonneId, rang + 1)}
          >
            ↓
          </button>
          <button
            type="button"
            className={styles.fleche}
            disabled={position >= colonnes.length - 1}
            aria-label={`Déplacer « ${carte.titre} » vers la colonne suivante`}
            onClick={() =>
              surDeplacement(carte.id, colonnes[position + 1].id, 0)
            }
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
