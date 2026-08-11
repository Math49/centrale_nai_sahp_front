import createClient, { type Middleware } from 'openapi-fetch';

import { magasinSession } from '@/auth/session';
import type { paths } from './contrat';

type ConfigurationNavigateur = Window &
  typeof globalThis & {
    __CENTRALE_NI_CONFIG__?: {
      apiUrl?: string;
    };
  };

function lireUrlApi(): string {
  if (typeof window !== 'undefined') {
    const urlRuntime = (window as ConfigurationNavigateur)
      .__CENTRALE_NI_CONFIG__?.apiUrl;

    if (urlRuntime?.trim()) {
      return urlRuntime.trim();
    }
  }

  return process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:40511';
}

export const URL_API = lireUrlApi();

export const api = createClient<paths>({
  baseUrl: URL_API,

  credentials: 'include',

  fetch: (requete) => globalThis.fetch(requete),
});

const authentificationEnMemoire: Middleware = {
  onRequest({ request }) {
    const jeton = magasinSession.lireJeton();

    if (!jeton) {
      return request;
    }

    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${jeton}`);

    return new Request(request, { headers });
  },
};

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

api.use(authentificationEnMemoire);
api.use(fermetureSurExpiration);
