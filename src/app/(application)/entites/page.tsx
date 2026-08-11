'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useEntites } from '@/api/entites';
import { useReferentiel } from '@/api/referentiel';
import controles from '@/composants/controles.module.css';
import { EtatVide } from '@/composants/etat-vide';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { Icone } from '@/composants/icones';
import { EnteteZone } from '@/composants/zone';
import styles from './annuaire.module.css';

export default function PageEntites() {
  const referentiel = useReferentiel();
  const [typeChoisi, definirTypeChoisi] = useState<string | null>(null);
  const [recherche, definirRecherche] = useState('');

  const types = referentiel.data?.typesEntites ?? [];
  const entites = useEntites({
    typeEntiteId: typeChoisi ?? undefined,
    q: recherche,
  });

  const nommer = (id: string) =>
    types.find((type) => type.id === id)?.libelle ?? '—';

  const trouverType = (id: string) =>
    types.find((type) => type.id === id) ?? null;

  return (
    <>
      <EnteteZone
        titre="Données"
        sousTitre="Tout ce que la centrale sait décrire. Les objets privés n’y figurent pas — leur absence ne se signale pas."
      />

      {types.length === 0 ? (
        <EtatVide
          titre="Aucun type de donnée n’est configuré."
          explication="Le modèle se règle en administration : types, champs, types de liens, onglets."
          action={
            <Link className={controles.bouton} href="/admin/types-entites">
              Ouvrir la configuration
            </Link>
          }
        />
      ) : (
        <>
          <div className={styles.barre}>
            <div className={styles.filtres}>
              <button
                type="button"
                className={styles.filtre}
                aria-pressed={typeChoisi === null}
                onClick={() => definirTypeChoisi(null)}
              >
                <Icone nom="entite" taille={13} />
                Tout
              </button>
              {types.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  className={styles.filtre}
                  aria-pressed={typeChoisi === type.id}
                  onClick={() => definirTypeChoisi(type.id)}
                >
                  <IconeFontAwesome valeur={type.icone} taille={13} />
                  {type.libellePluriel}
                </button>
              ))}
            </div>

            <input
              className={controles.champ}
              value={recherche}
              onChange={(evenement) => definirRecherche(evenement.target.value)}
              placeholder="Filtrer par libellé"
              aria-label="Filtrer l’annuaire"
            />
          </div>

          <div className={styles.creations}>
            {(typeChoisi
              ? types.filter((type) => type.id === typeChoisi)
              : types
            ).map((type) => (
              <Link
                key={type.id}
                className={`${controles.bouton} ${styles.creation}`}
                href={`/entites/nouveau?type=${type.id}`}
              >
                <Icone nom="plus" taille={12} />
                {type.libelle}
              </Link>
            ))}
          </div>

          {entites.isLoading && (
            <p className={controles.remarque}>Chargement…</p>
          )}

          {entites.isSuccess && entites.data.length === 0 ? (
            <EtatVide
              titre="Aucune fiche ici."
              explication="Commencer par le plus concret — un véhicule, une personne — puis relier."
            />
          ) : (
            <ul className={styles.liste}>
              {(entites.data ?? []).map((entite) => {
                const typeEntite = trouverType(entite.typeEntiteId);

                return (
                  <li key={entite.id} className={styles.ligne}>
                    <Link
                      className={styles.libelle}
                      href={`/entites/${entite.id}`}
                    >
                      {entite.libelle}
                    </Link>
                    <span className={styles.type}>
                      {typeEntite && (
                        <IconeFontAwesome
                          valeur={typeEntite.icone}
                          taille={13}
                        />
                      )}
                      {nommer(entite.typeEntiteId)}
                    </span>
                    {entite.visibilite !== 'public' && (
                      <span
                        className={
                          entite.visibilite === 'prive'
                            ? styles.prive
                            : styles.restreint
                        }
                      >
                        {entite.visibilite}
                      </span>
                    )}
                    {entite.etat === 'archive' && (
                      <span className={styles.archive}>archivée</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
