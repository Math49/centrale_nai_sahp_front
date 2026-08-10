'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { useEntite } from '@/api/entites';
import controles from '@/composants/controles.module.css';
import { Icone, iconeDeType } from '@/composants/icones';
import { PastilleFiabilite, PastilleVisibilite } from '@/composants/pastilles';
import styles from './panneau-donnee.module.css';

/**
 * Fiche d'une donnée, ouverte depuis le graphe — un panneau qui vient de la
 * droite plutôt qu'une navigation.
 *
 * L'agent regarde une carte ; l'envoyer sur une autre page lui ferait perdre sa
 * position, son filtre et sa mise au point. Le panneau lui rend la fiche sans
 * lui prendre le graphe, et un lien reste offert pour l'ouvrir en entier.
 *
 * La fiche arrive **assemblée par l'API**, comme partout ailleurs : ses champs
 * sont recomposés depuis les seuls faits visibles par cet agent, et ce panneau
 * n'en refait aucun calcul.
 */
export function PanneauDonnee({
  id,
  surFermeture,
}: {
  id: string;
  surFermeture: () => void;
}) {
  const fiche = useEntite(id);

  // La touche d'échappement referme : le panneau se superpose au graphe, il
  // doit se retirer aussi vite qu'il est venu.
  useEffect(() => {
    const auClavier = (evenement: KeyboardEvent): void => {
      if (evenement.key === 'Escape') {
        surFermeture();
      }
    };

    document.addEventListener('keydown', auClavier);
    return () => document.removeEventListener('keydown', auClavier);
  }, [surFermeture]);

  const donnee = fiche.data;

  return (
    <aside
      className={styles.panneau}
      role="complementary"
      aria-label="Fiche de la donnée"
    >
      <header className={styles.tete}>
        {donnee && (
          <span className={styles.icone}>
            <Icone nom={iconeDeType(donnee.typeCode)} taille={19} />
          </span>
        )}

        <div className={styles.identite}>
          <p className={styles.libelle}>
            {donnee?.libelle ?? (fiche.isError ? 'Donnée inaccessible' : '…')}
          </p>
          {donnee && (
            <p className={styles.type}>
              {donnee.typeLibelle}
              {donnee.etat === 'archive' && ' · archivée'}
            </p>
          )}
        </div>

        <button
          type="button"
          className={styles.fermer}
          onClick={surFermeture}
          aria-label="Fermer le panneau"
        >
          <Icone nom="fermer" taille={16} />
        </button>
      </header>

      {fiche.isError && (
        <p className={controles.remarque}>
          Cette donnée n’existe pas, ou vous n’y avez pas accès — la centrale ne
          fait pas la différence, à dessein.
        </p>
      )}

      {donnee && (
        <div className={styles.corps}>
          <div className={styles.marques}>
            <PastilleVisibilite niveau={donnee.visibilite} />
            {!donnee.contenuLisible && (
              <span className={styles.restreint}>contenu restreint</span>
            )}
          </div>

          {donnee.dossiers.length > 0 && (
            <p className={styles.rattachements}>
              Suivie par{' '}
              {donnee.dossiers.map((dossier) => dossier.nom).join(', ')}
            </p>
          )}

          <section>
            <p className="section">Identité</p>
            <dl className={styles.champs}>
              {donnee.champs.map((champ) => {
                const meilleur = champ.faits[0];

                return (
                  <div key={champ.definitionChampId} className={styles.champ}>
                    <dt className={styles.cle}>{champ.libelle}</dt>
                    <dd className={styles.valeur}>
                      {champ.valeur === null || champ.valeur === undefined ? (
                        <span className={styles.vide}>non renseigné</span>
                      ) : (
                        <span
                          className={
                            champ.typeDonnee === 'texte' ? undefined : 'mono'
                          }
                        >
                          {Array.isArray(champ.valeur)
                            ? champ.valeur.map(String).join(' · ')
                            : String(champ.valeur)}
                        </span>
                      )}
                      {meilleur && (
                        <PastilleFiabilite
                          niveau={meilleur.fiabilite}
                          source={meilleur.source}
                        />
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          <section>
            <p className="section">Liens · {donnee.liens.length}</p>
            <ul className={styles.liens}>
              {donnee.liens.slice(0, 12).map((lien) => (
                <li key={lien.faitId} className={styles.lien}>
                  <span className={styles.lienLibelle}>{lien.libelle}</span>
                  <span className={styles.lienCible}>
                    {lien.autreEntite.libelle}
                  </span>
                  <PastilleFiabilite
                    niveau={lien.fiabilite}
                    source={lien.source}
                  />
                </li>
              ))}
            </ul>
            {donnee.liens.length > 12 && (
              <p className={controles.remarque}>
                et {donnee.liens.length - 12} autres — voir la fiche entière.
              </p>
            )}
          </section>

          {donnee.note && (
            <section>
              <p className="section">Note</p>
              <p className={styles.note}>{donnee.note}</p>
            </section>
          )}
        </div>
      )}

      <footer className={styles.pied}>
        <Link className={controles.bouton} href={`/entites/${id}`}>
          Ouvrir la fiche entière
        </Link>
      </footer>
    </aside>
  );
}
