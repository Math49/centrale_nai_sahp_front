import createClient, { type Middleware } from 'openapi-fetch';

import { magasinSession } from '@/auth/session';
import type { paths } from './contrat';

export const URL_API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = createClient<paths>({
  baseUrl: URL_API,
  // Résolu à chaque appel plutôt que capturé au chargement du module : le
  // client ne fige pas la référence à `fetch`, ce qui le rend observable en
  // test et insensible à un remplacement tardif.
  fetch: (requete) => globalThis.fetch(requete),
});

/**
 * Les routes d'authentification rendent compte de leurs propres échecs : un 401
 * y signifie « identifiants invalides », pas « session expirée ». Partout
 * ailleurs, un 401 sur une requête qui portait un jeton ne peut vouloir dire
 * qu'une chose — le jeton n'est plus valable.
 */
function estUneRouteDAuthentification(url: string): boolean {
  return new URL(url).pathname.startsWith('/auth/');
}

const porteurDeJeton: Middleware = {
  onRequest({ request }) {
    const { jeton } = magasinSession.lire();

    if (jeton) {
      request.headers.set('Authorization', `Bearer ${jeton}`);
    }

    return request;
  },

  onResponse({ request, response }) {
    const portaitUnJeton = request.headers.has('Authorization');

    if (
      response.status === 401 &&
      portaitUnJeton &&
      !estUneRouteDAuthentification(request.url)
    ) {
      magasinSession.fermer('expiration');
    }

    return response;
  },
};

api.use(porteurDeJeton);
