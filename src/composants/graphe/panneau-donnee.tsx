'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { useEntite } from '@/api/entites';
import { useReferentiel } from '@/api/referentiel';
import { lirePoints } from '@/composants/carte/choix-point';
import { libelleDuPoint } from '@/composants/carte/fond';
import controles from '@/composants/controles.module.css';
import { IconeFontAwesome } from '@/composants/icone-fontawesome';
import { Icone } from '@/composants/icones';
import { PastilleFiabilite, PastilleVisibilite } from '@/composants/pastilles';
import styles from './panneau-donnee.module.css';

export function PanneauDonnee({
  id,
  surFermeture,
}: {
  id: string;
  surFermeture: () => void;
}) {
  const fiche = useEntite(id);
  const referentiel = useReferentiel();

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
  const type = referentiel.data?.typesEntites.find(
    (candidat) => candidat.code === donnee?.typeCode,
  );

  return (
    <aside
      className={styles.panneau}
      role="complementary"
      aria-label="Fiche de la donnée"
    >
      <header className={styles.tete}>
        {donnee && (
          <span className={styles.icone}>
            {type ? (
              <IconeFontAwesome valeur={type.icone} taille={19} />
            ) : (
              <Icone nom="entite" taille={19} />
            )}
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
                          {/* Pas de plan ici : le panneau est un résumé, posé
                              dans une vue qui est déjà une carte. Les
                              coordonnées suffisent ; la carte est sur la
                              fiche. */}
                          {champ.typeDonnee === 'carte'
                            ? lirePoints(champ.valeur)
                                .map(libelleDuPoint)
                                .join('  ·  ')
                            : Array.isArray(champ.valeur)
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
