'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Logo } from '@/composants/logo';
import controles from '@/composants/controles.module.css';
import { useConnexion, useSession } from '@/auth/use-session';
import styles from './page.module.css';

export default function PageConnexion() {
  const router = useRouter();
  const { agent, raisonFermeture } = useSession();
  const connexion = useConnexion();

  const [matricule, definirMatricule] = useState('');
  const [motDePasse, definirMotDePasse] = useState('');

  useEffect(() => {
    if (!agent) {
      return;
    }

    router.replace(agent.doitChangerMdp ? '/mot-de-passe' : '/');
  }, [agent, router]);

  return (
    <div className={styles.page}>
      <div className={styles.carte}>
        <div className={styles.entete}>
          <Logo taille={40} />
          <div>
            <h1 className={styles.titre}>
              Centrale <span className={styles.sigle}>N&amp;I</span>
            </h1>
            <p className={styles.service}>
              Narcotics &amp; Investigations · San Andreas Highway Patrol
            </p>
          </div>
        </div>

        {raisonFermeture === 'expiration' && (
          <p className={controles.erreur}>
            Session expirée. Se reconnecter pour reprendre.
          </p>
        )}

        <form
          className={styles.formulaire}
          onSubmit={(evenement) => {
            evenement.preventDefault();
            connexion.mutate({ matricule, motDePasse });
          }}
        >
          <div className={controles.groupe}>
            <label className={controles.etiquette} htmlFor="matricule">
              Matricule
            </label>
            <input
              id="matricule"
              className={controles.champMono}
              value={matricule}
              onChange={(evenement) => definirMatricule(evenement.target.value)}
              autoComplete="username"
              autoFocus
              required
              disabled={connexion.isPending}
            />
          </div>

          <div className={controles.groupe}>
            <label className={controles.etiquette} htmlFor="mot-de-passe">
              Mot de passe
            </label>
            <input
              id="mot-de-passe"
              className={controles.champ}
              type="password"
              value={motDePasse}
              onChange={(evenement) =>
                definirMotDePasse(evenement.target.value)
              }
              autoComplete="current-password"
              required
              disabled={connexion.isPending}
            />
          </div>

          {connexion.isError && (
            <p className={controles.erreur} role="alert">
              {connexion.error.message}
            </p>
          )}

          <button
            type="submit"
            className={controles.bouton}
            disabled={connexion.isPending}
          >
            {connexion.isPending ? 'Vérification…' : 'Se connecter'}
          </button>
        </form>

        <p className={styles.mention}>
          Les comptes sont créés par l&apos;administration. Il n&apos;existe pas
          d&apos;inscription.
        </p>
      </div>
    </div>
  );
}
