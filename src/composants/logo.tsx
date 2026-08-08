/**
 * Badge SAHP Narcotics — étoile à sept branches, noir et blanc.
 *
 * Aucune couleur : le logo est la seule marque d'identité, et la couleur est
 * réservée à la fiabilité et à la visibilité.
 */
const BRANCHES =
  '50,0 59.5,30.2 89.1,18.8 71.5,45.1 98.8,61.1 67.2,63.7 71.7,95.1 50,72 28.3,95.1 32.8,63.7 1.2,61.1 28.5,45.1 10.9,18.8 40.5,30.2';

export function Logo({ taille = 26 }: { taille?: number }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Centrale N&I"
    >
      <polygon
        points={BRANCHES}
        fill="none"
        stroke="var(--texte)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle
        cx="50"
        cy="50"
        r="13"
        fill="none"
        stroke="var(--texte)"
        strokeWidth="5"
      />
    </svg>
  );
}
