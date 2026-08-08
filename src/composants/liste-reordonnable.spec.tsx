import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ListeReordonnable } from './liste-reordonnable';

const elements = [
  { id: 'a', libelle: 'Plaque' },
  { id: 'b', libelle: 'Modèle' },
  { id: 'c', libelle: 'Couleur' },
];

function afficher(onOrdonner = vi.fn()) {
  render(
    <ListeReordonnable
      elements={elements}
      rendu={(element) => <span>{element.libelle}</span>}
      onOrdonner={onOrdonner}
    />,
  );

  return onOrdonner;
}

describe('ListeReordonnable', () => {
  it('envoie le jeu complet, pas seulement le déplacé', () => {
    const onOrdonner = afficher();

    screen.getAllByLabelText('Descendre')[0].click();

    expect(onOrdonner).toHaveBeenCalledWith(['b', 'a', 'c']);
  });

  it('remonte un élément', () => {
    const onOrdonner = afficher();

    screen.getAllByLabelText('Monter')[2].click();

    expect(onOrdonner).toHaveBeenCalledWith(['a', 'c', 'b']);
  });

  it('ne propose pas de monter le premier ni de descendre le dernier', () => {
    afficher();

    expect(screen.getAllByLabelText('Monter')[0]).toBeDisabled();
    expect(screen.getAllByLabelText('Descendre')[2]).toBeDisabled();
  });

  it("offre le clavier en plus du glisser-déposer, sans quoi l'ordre y serait inatteignable", () => {
    afficher();

    expect(screen.getAllByLabelText('Monter')).toHaveLength(3);
    expect(screen.getAllByLabelText('Descendre')).toHaveLength(3);
  });
});
