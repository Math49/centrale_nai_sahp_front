'use client';

import { useRef, useState } from 'react';

import {
  useApercuFichier,
  useDeposerFichier,
  useFichiers,
  useSupprimerFichier,
  type Fichier,
} from '@/api/fichiers';
import controles from './controles.module.css';
import { EtatVide } from './etat-vide';
import { Modale } from './modale';
import styles from './pieces-jointes.module.css';

/** Huit mégaoctets, comme le plafond de l'API — annoncé, jamais deviné. */
const PLAFOND_MO = 8;

const FORMATS = 'image/jpeg,image/png,image/webp';

/**
 * Pièces jointes d'une fiche.
 *
 * Ce que l'agent doit savoir avant de déposer est écrit à l'écran : les
 * formats acceptés, le plafond, et surtout que **les métadonnées sont
 * retirées**. Une photo porte souvent des coordonnées et un horodatage que
 * personne n'a décidé de verser au dossier ; le dire est autant une
 * information qu'une garantie.
 */
export function PiecesJointes({
  entiteId,
  peutDeposer,
}: {
  entiteId: string;
  peutDeposer: boolean;
}) {
  const fichiers = useFichiers(entiteId);
  const deposer = useDeposerFichier();
  const supprimer = useSupprimerFichier();

  const champ = useRef<HTMLInputElement>(null);
  const [aConfirmer, definirAConfirmer] = useState<File | null>(null);
  const [fichierASupprimer, definirFichierASupprimer] =
    useState<Fichier | null>(null);

  const trop = aConfirmer && aConfirmer.size > PLAFOND_MO * 1024 * 1024;

  return (
    <>
      <p className={controles.remarque}>
        JPEG, PNG ou WebP, {PLAFOND_MO} Mo au plus. Le type est vérifié sur le
        contenu, et les métadonnées — EXIF, coordonnées, horodatage d’appareil —
        sont retirées au dépôt.
      </p>

      {peutDeposer && (
        <div className={styles.depot}>
          <input
            ref={champ}
            className={styles.entree}
            type="file"
            accept={FORMATS}
            onChange={(evenement) => {
              const choisi = evenement.target.files?.[0] ?? null;
              definirAConfirmer(choisi);
            }}
          />
          <button
            type="button"
            className={controles.boutonDiscret}
            onClick={() => champ.current?.click()}
          >
            Déposer une image
          </button>
        </div>
      )}

      {fichiers.data && fichiers.data.length === 0 ? (
        <EtatVide
          titre="Aucune image sur cette fiche."
          explication="Une photo de la carte en jeu, une capture de plaque, un cliché de planque : tout ce qui se prouve par l’image."
        />
      ) : (
        <ul className={styles.galerie}>
          {(fichiers.data ?? []).map((fichier) => (
            <Vignette
              key={fichier.id}
              fichier={fichier}
              peutSupprimer={peutDeposer}
              onSupprimer={() => definirFichierASupprimer(fichier)}
            />
          ))}
        </ul>
      )}

      {aConfirmer && (
        <Modale
          titre="Déposer cette image ?"
          libelleConfirmation="Déposer"
          enCours={deposer.isPending}
          onAnnuler={() => {
            definirAConfirmer(null);
            if (champ.current) champ.current.value = '';
          }}
          onConfirmer={() => {
            if (trop) {
              return;
            }

            deposer.mutate(
              { entiteId, fichier: aConfirmer },
              {
                onSuccess: () => {
                  definirAConfirmer(null);
                  if (champ.current) champ.current.value = '';
                },
              },
            );
          }}
        >
          <p>
            <strong>{aConfirmer.name}</strong> —{' '}
            <span className="mono">
              {(aConfirmer.size / 1024).toFixed(0)} ko
            </span>
          </p>
          <p className={controles.remarque}>
            L’image sera rangée sous un nom opaque et servie uniquement à qui a
            accès à cette fiche. Ses métadonnées seront retirées.
          </p>

          {trop && (
            <p className={controles.erreur}>
              Au-delà de {PLAFOND_MO} Mo — l’API la refuserait.
            </p>
          )}

          {deposer.isError && (
            <p className={controles.erreur}>{deposer.error.message}</p>
          )}
        </Modale>
      )}

      {fichierASupprimer && (
        <Modale
          titre="Supprimer cette image ?"
          libelleConfirmation="Supprimer"
          enCours={supprimer.isPending}
          irreversible
          onAnnuler={() => definirFichierASupprimer(null)}
          onConfirmer={() =>
            supprimer.mutate(
              { id: fichierASupprimer.id, entiteId },
              {
                onSuccess: () => definirFichierASupprimer(null),
              },
            )
          }
        >
          <p>
            <strong>{fichierASupprimer.nomOrigine}</strong>
          </p>
          <p className={controles.remarque}>
            L’image disparaîtra de cette fiche. Si un fait l’utilise encore, la
            suppression sera refusée.
          </p>
          {supprimer.isError && (
            <p className={controles.erreur}>{supprimer.error.message}</p>
          )}
        </Modale>
      )}
    </>
  );
}

function Vignette({
  fichier,
  peutSupprimer,
  onSupprimer,
}: {
  fichier: Fichier;
  peutSupprimer: boolean;
  onSupprimer: () => void;
}) {
  const apercu = useApercuFichier(fichier.id);

  return (
    <li className={styles.vignette}>
      <div className={styles.cadre}>
        {apercu.url ? (
          /* L'octet vient d'une requête authentifiée et vit dans un `blob:` :
             `next/image` irait le chercher lui-même, sans jeton. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            className={styles.image}
            src={apercu.url}
            alt={fichier.nomOrigine}
          />
        ) : (
          <span className={styles.attente}>
            {apercu.enErreur ? 'indisponible' : 'chargement…'}
          </span>
        )}
      </div>

      <p className={styles.nom} title={fichier.nomOrigine}>
        {fichier.nomOrigine}
      </p>
      <p className={styles.detail}>
        <span className="mono">{fichier.deposeLe.slice(0, 10)}</span>
        {' · '}
        <span className="mono">{(fichier.taille / 1024).toFixed(0)} ko</span>
      </p>
      {peutSupprimer && (
        <button
          type="button"
          className={controles.boutonDiscret}
          onClick={onSupprimer}
        >
          Supprimer
        </button>
      )}
    </li>
  );
}
