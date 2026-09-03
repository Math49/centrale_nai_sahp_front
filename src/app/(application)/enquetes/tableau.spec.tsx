import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CarteEnquete, ColonneKanban } from '@/api/enquetes';
import { Tableau } from './tableau';

const COLONNES: ColonneKanban[] = [
  { id: 'col-1', code: 'a_faire', libelle: 'À faire', ordre: 0 },
  { id: 'col-2', code: 'en_cours', libelle: 'En cours', ordre: 1 },
];

function carte(
  id: string,
  colonneId: string,
  rang: number,
  assignes: CarteEnquete['assignes'] = [],
): CarteEnquete {
  return {
    id,
    colonneId,
    rang,
    titre: `Carte ${id}`,
    description: null,
    echeance: null,
    dossier: null,
    entite: null,
    assignes,
    visibilite: 'public',
    etat: 'actif',
    auteurLibelle: 'Noa Duval',
    creeLe: '2026-09-01T10:00:00.000Z',
    modifieLe: '2026-09-01T10:00:00.000Z',
    habilitations: [],
  };
}

function afficher(
  cartes: CarteEnquete[],
  { peutEcrire = true }: { peutEcrire?: boolean } = {},
) {
  const surDeplacement = vi.fn();
  const surOuverture = vi.fn();

  render(
    <Tableau
      colonnes={COLONNES}
      cartes={cartes}
      peutEcrire={peutEcrire}
      surOuverture={surOuverture}
      surDeplacement={surDeplacement}
    />,
  );

  return { surDeplacement, surOuverture };
}

describe('Tableau des enquêtes', () => {
  it('range chaque carte dans sa colonne, par rang', () => {
    afficher([
      carte('b', 'col-1', 1),
      carte('a', 'col-1', 0),
      carte('c', 'col-2', 0),
    ]);

    const colonnes = document.querySelectorAll('section');
    const premiere = colonnes[0].textContent ?? '';

    expect(premiere.indexOf('Carte a')).toBeLessThan(
      premiere.indexOf('Carte b'),
    );
    expect(colonnes[1].textContent).toContain('Carte c');
  });

  it('déplace vers la colonne suivante par le repli clavier', () => {
    // jsdom ne simule pas le glisser-déposer natif : ce sont les flèches que
    // les tests exercent, et c'est aussi ce dont se sert qui ne glisse pas.
    const { surDeplacement } = afficher([carte('a', 'col-1', 0)]);

    fireEvent.click(
      screen.getByRole('button', {
        name: /vers la colonne suivante/,
      }),
    );

    expect(surDeplacement).toHaveBeenCalledWith('a', 'col-2', 0);
  });

  it('monte et descend une carte dans sa colonne', () => {
    const { surDeplacement } = afficher([
      carte('a', 'col-1', 0),
      carte('b', 'col-1', 1),
    ]);

    fireEvent.click(
      screen.getByRole('button', { name: /Descendre « Carte a/ }),
    );
    expect(surDeplacement).toHaveBeenCalledWith('a', 'col-1', 1);

    fireEvent.click(screen.getByRole('button', { name: /Monter « Carte b/ }));
    expect(surDeplacement).toHaveBeenCalledWith('b', 'col-1', 0);
  });

  it('ferme les flèches aux extrémités', () => {
    afficher([carte('a', 'col-1', 0)]);

    expect(
      screen.getByRole('button', { name: /colonne précédente/ }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /Monter/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Descendre/ })).toBeDisabled();
  });

  it('n’offre aucun déplacement sans le geste d’écriture', () => {
    afficher([carte('a', 'col-1', 0)], { peutEcrire: false });

    expect(
      screen.queryByRole('button', { name: /colonne suivante/ }),
    ).toBeNull();
    expect(screen.getByText('Carte a').closest('div')).not.toHaveAttribute(
      'draggable',
      'true',
    );
  });

  it('signale l’assigné qui ne peut pas lire la carte', () => {
    // La propriété du lot : assigner n'ouvre pas. La pastille doit le dire,
    // sinon on croit avoir donné l'accès en donnant le travail.
    afficher([
      carte('a', 'col-1', 0, [
        {
          agentId: 'ag-1',
          libelle: 'Sasha Vane',
          matricule: 'ji-003',
          initiales: 'SV',
          peutLire: false,
          assigneLe: '2026-09-01T10:00:00.000Z',
        },
        {
          agentId: 'ag-2',
          libelle: 'Noa Duval',
          matricule: 'si-002',
          initiales: 'ND',
          peutLire: true,
          assigneLe: '2026-09-01T10:00:00.000Z',
        },
      ]),
    ]);

    const aveugle = screen.getByText('SV');
    const lecteur = screen.getByText('ND');

    expect(aveugle).toHaveAttribute('data-aveugle', 'true');
    expect(aveugle.getAttribute('title')).toMatch(/ne peut pas lire/);
    expect(lecteur).toHaveAttribute('data-aveugle', 'false');
  });

  it('ouvre une carte au clic sur son titre', () => {
    const { surOuverture } = afficher([carte('a', 'col-1', 0)]);

    fireEvent.click(screen.getByText('Carte a'));

    expect(surOuverture).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a' }),
    );
  });

  it('dit ce qu’une colonne vide attend', () => {
    afficher([carte('a', 'col-1', 0)]);

    expect(screen.getByText('Rien ici.')).toBeInTheDocument();
  });
});
