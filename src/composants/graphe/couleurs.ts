/**
 * Couleur d'un nœud selon son type de donnée.
 *
 * Une entorse assumée à la règle « la couleur est réservée à la fiabilité et à
 * la visibilité », et bornée : elle ne vaut **que sur les nœuds du graphe**.
 * La fiabilité garde les arêtes, la visibilité garde ses pastilles. Deux
 * échelles portées par deux objets différents se lisent ; deux échelles sur le
 * même objet se disputent.
 *
 * Teintes choisies pour rester distinctes en vision anormale des couleurs :
 * elles diffèrent autant par la clarté que par la teinte, et la forme du
 * libellé reste le premier moyen de reconnaître un nœud.
 */
export const COULEURS_TYPE: Record<string, string> = {
  personne: '#6f9dc4',
  vehicule: '#c98f5a',
  lieu: '#5fb3a1',
  evenement: '#c2708f',
  groupe: '#9186cc',
};

export const COULEUR_TYPE_INCONNU = '#6b7683';

/** Libellés de la légende, dans l'ordre où ils s'affichent. */
export const LEGENDE_TYPES: { code: string; libelle: string }[] = [
  { code: 'personne', libelle: 'Personne' },
  { code: 'vehicule', libelle: 'Véhicule' },
  { code: 'lieu', libelle: 'Lieu' },
  { code: 'evenement', libelle: 'Événement' },
  { code: 'groupe', libelle: 'Groupe' },
];
