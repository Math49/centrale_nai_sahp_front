import createClient, { type Middleware } from 'openapi-fetch';

import { magasinSession } from '@/auth/session';
import type { paths } from './contrat';

export const URL_API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = createClient<paths>({
  baseUrl: URL_API,

  // Le jeton vit dans un cookie `httpOnly` que le navigateur envoie seul :
  // sans `credentials`, il ne partirait pas vers une origine différente, et
  // aucune requête ne serait authentifiée.
  credentials: 'include',

  // Résolu à chaque appel plutôt que capturé au chargement du module : le
  // client ne fige pas la référence à `fetch`, ce qui le rend observable en
  // test et insensible à un remplacement tardif.
  fetch: (requete) => globalThis.fetch(requete),
});

/**
 * Les routes d'authentification rendent compte de leurs propres échecs : un 401
 * y signifie « identifiants invalides », pas « session expirée ». Partout
 * ailleurs, un 401 ne peut vouloir dire qu'une chose — le cookie n'est plus
 * valable.
 */
function estUneRouteDAuthentification(url: string): boolean {
  return new URL(url).pathname.startsWith('/auth/');
}

const fermetureSurExpiration: Middleware = {
  onResponse({ request, response }) {
    if (response.status === 401 && !estUneRouteDAuthentification(request.url)) {
      magasinSession.fermer('expiration');
    }

    return response;
  },
};

api.use(fermetureSurExpiration);
