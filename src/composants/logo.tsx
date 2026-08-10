/**
 * Badge SAHP Narcotics — étoile à sept branches.
 *
 * Redessiné plutôt que repris du sceau officiel : à la taille où il sert —
 * trente pixels dans la barre latérale — la gravure du sceau de l'État serait
 * une bouillie. Un mark vectoriel reste lisible à toutes les tailles.
 *
 * **Monochrome, et volontairement** : le logo est la seule marque d'identité,
 * et la couleur de l'interface est réservée à la fiabilité et à la visibilité.
 *
 * `detail` fait apparaître l'anneau gravé et le matricule d'unité — à réserver
 * aux grandes tailles, écran de connexion notamment.
 */

/** Sommets d'une étoile à sept branches, rayon externe 50, interne 21. */
function pointesEtoile(externe: number, interne: number): string {
  const sommets: string[] = [];

  for (let index = 0; index < 14; index += 1) {
    // On part vers le haut : -90°, puis un sommet tous les 1/14e de tour.
    const angle = (Math.PI * 2 * index) / 14 - Math.PI / 2;
    const rayon = index % 2 === 0 ? externe : interne;

    sommets.push(
      `${(50 + rayon * Math.cos(angle)).toFixed(2)},${(50 + rayon * Math.sin(angle)).toFixed(2)}`,
    );
  }

  return sommets.join(' ');
}

const ETOILE = pointesEtoile(49, 22);

export function Logo({
  taille = 28,
  detail = false,
}: {
  taille?: number;
  detail?: boolean;
}) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Centrale N&I — SAHP Narcotics"
    >
      <defs>
        {/* Le disque central est évidé de l'étoile : l'anneau reste net même
            quand le mark est posé sur une surface claire. */}
        <mask id="coeur-badge">
          <rect width="100" height="100" fill="white" />
          <circle cx="50" cy="50" r="21" fill="black" />
        </mask>
      </defs>

      <polygon
        points={ETOILE}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        mask="url(#coeur-badge)"
        opacity="0.92"
      />

      <circle
        cx="50"
        cy="50"
        r="24.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      {detail && (
        <>
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <text
            x="50"
            y="55.5"
            textAnchor="middle"
            fontSize="15"
            fontWeight="600"
            fontFamily="var(--police-mono)"
            fill="currentColor"
            letterSpacing="0.5"
          >
            091
          </text>
        </>
      )}
    </svg>
  );
}
