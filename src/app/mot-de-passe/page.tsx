'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useChangementMotDePasse, useSession } from '@/auth/use-session';
import controles from '@/composants/controles.module.css';
import { Logo } from '@/composants/logo';
import styles from './page.module.css';

const LONGUEUR_MINIMALE = 12;

export default function PageMotDePasse() {
  const router = useRouter();
  const { agent } = useSession();
  const changement = useChangementMotDePasse();

  const [ancien, definirAncien] = useState('');
  const [nouveau, definirNouveau] = useState('');
  const [confirmation, definirConfirmation] = useState('');

  useEffect(() => {
    if (!agent) {
      router.replace('/connexion');
      return;
    }

    // Le changement fait, l'agent rejoint l'application.
    if (agent && !agent.doitChangerMdp && changement.isSuccess) {
      router.replace('/');
    }
  }, [agent, changement.isSuccess, router]);

  const discordant = confirmation.length > 0 && nouveau !== confirmation;
  const tropCourt = nouveau.length > 0 && nouveau.length < LONGUEUR_MINIMALE;
  const soumettable =
    ancien.length > 0 && nouveau.length >= LONGUEUR_MINIMALE && !discordant;

  return (
    <div className={styles.page}>
      <div className={styles.carte}>
        <div className={styles.entete}>
          <Logo taille={40} />
          <h1 className={styles.titre}>Changement de mot de passe</h1>
        </div>

        <p className={styles.explication}>
          {agent?.doitChangerMdp
            ? 'Le mot de passe provisoire doit être remplacé avant tout accès aux dossiers.'
            : 'Le changement invalide les sessions ouvertes sur les autres postes.'}
        </p>

        <form
          className={styles.formulaire}
          onSubmit={(evenement) => {
            evenement.preventDefault();
            changement.mutate({ ancien, nouveau });
          }}
        >
          <div className={controles.groupe}>
            <label className={controles.etiquette} htmlFor="ancien">
              Mot de passe actuel
            </label>
            <input
              id="ancien"
              className={controles.champ}
              type="password"
              value={ancien}
              onChange={(evenement) => definirAncien(evenement.target.value)}
              autoComplete="current-password"
              autoFocus
              required
              disabled={changement.isPending}
            />
          </div>

          <div className={controles.groupe}>
            <label className={controles.etiquette} htmlFor="nouveau">
              Nouveau mot de passe
            </label>
            <input
              id="nouveau"
              className={controles.champ}
              type="password"
              value={nouveau}
              onChange={(evenement) => definirNouveau(evenement.target.value)}
              autoComplete="new-password"
              required
              disabled={changement.isPending}
            />
            <span className={controles.remarque}>
              {tropCourt
                ? `Encore ${LONGUEUR_MINIMALE - nouveau.length} caractères.`
                : `${LONGUEUR_MINIMALE} caractères au minimum.`}
            </span>
          </div>

          <div className={controles.groupe}>
            <label className={controles.etiquette} htmlFor="confirmation">
              Confirmation
            </label>
            <input
              id="confirmation"
              className={controles.champ}
              type="password"
              value={confirmation}
              onChange={(evenement) =>
                definirConfirmation(evenement.target.value)
              }
              autoComplete="new-password"
              required
              disabled={changement.isPending}
            />
            {discordant && (
              <span className={controles.remarque}>
                Les deux saisies diffèrent.
              </span>
            )}
          </div>

          {changement.isError && (
            <p className={controles.erreur} role="alert">
              {changement.error.message}
            </p>
          )}

          <button
            type="submit"
            className={controles.bouton}
            disabled={!soumettable || changement.isPending}
          >
            {changement.isPending
              ? 'Enregistrement…'
              : 'Changer le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
