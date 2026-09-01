'use client';

import { useSession } from './use-session';

/**
 * L'agent dispose-t-il de ce geste ?
 *
 * **Ce n'est jamais ce qui autorise.** L'API refuse d'elle-même, sans rien
 * croire de ce qui vient du navigateur : ce crochet ne sert qu'à ne pas
 * proposer une porte fermée. Montrer un bouton qui répondra 403 n'est pas une
 * faille, c'est une promesse qu'on ne tient pas.
 *
 * Le super-admin passe partout : l'attribut du compte prime sur le jeu de
 * permissions de son grade, comme côté API.
 *
 * Rassemblé ici parce que la formule était recopiée écran par écran, et qu'un
 * geste oublié ne se voyait nulle part — c'est exactement ce qui a laissé un
 * grade sans permission devant un bouton « Nouveau dossier ».
 */
export function usePermission(code: string): boolean {
  const { agent } = useSession();

  if (!agent) {
    return false;
  }

  return agent.superAdmin || agent.permissions.includes(code);
}
