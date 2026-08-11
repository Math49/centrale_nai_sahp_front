import createClient, { type Middleware } from 'openapi-fetch';

import { magasinSession } from '@/auth/session';
import type { paths } from './contrat';

export const URL_API =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = createClient<paths>({
  baseUrl: URL_API,

  credentials: 'include',

  fetch: (requete) => globalThis.fetch(requete),
});

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
