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

export const MESSAGE_INJOIGNABLE =
  "la centrale ne répond pas — vérifier que l'API est démarrée";
