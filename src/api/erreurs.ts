/**
 * Traduction d'une erreur d'API en une phrase affichable.
 *
 * NestJS renvoie `{ statusCode, message, error }`, où `message` est une chaîne
 * ou un tableau de chaînes selon qu'elle vient d'une exception ou du pipe de
 * validation. Le front ne doit jamais afficher un objet brut à l'agent.
 */
export function messageDErreur(erreur: unknown, defaut: string): string {
  if (typeof erreur === 'string' && erreur.length > 0) {
    return erreur;
  }

  if (erreur && typeof erreur === 'object' && 'message' in erreur) {
    const message = (erreur as { message: unknown }).message;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }

    if (Array.isArray(message) && message.length > 0) {
      return message.filter((ligne) => typeof ligne === 'string').join(' · ');
    }
  }

  return defaut;
}

/** Erreur réseau : l'API n'a pas répondu du tout. */
export const MESSAGE_INJOIGNABLE =
  "la centrale ne répond pas — vérifier que l'API est démarrée";
