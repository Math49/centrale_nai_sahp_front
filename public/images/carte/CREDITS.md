# Fond de carte — origine et attribution

Les tuiles de `postal/` et l'image `cayo-perico.webp` proviennent de
[fivenet-app/livemap-tiles](https://github.com/fivenet-app/livemap-tiles),
sous **licence Apache 2.0** — copie intégrale dans `LICENSE-tuiles.txt`.

Elles sont **redistribuées ici en l'état**, sans modification.

## Cartes d'origine

- **Plan postal** — [Postal Code Map & Minimap, v1.3](https://forum.cfx.re/t/release-postal-code-map-minimap-new-improved-v1-3/147458)
  par [Virus_City](https://forum.cfx.re/u/Virus_City), d'après
  [DLK HD Atlas Map For FiveM](https://aothsa.com/2021/08/08/dlk-hd-atlas-map-for-fivem/)
  de [DieLikeKane](https://aothsa.com/gtav-fivem-map-mods/)
- **Cayo Perico** — [Cayo Perico Atlas Postal Map](https://forum.cfx.re/t/cayo-perico-atlas-postal-map-free/5275857)
  par [DZ2024](https://forum.cfx.re/u/DZ2024)

## Ce qui a été retenu, et pourquoi

Du dépôt d'origine — deux styles, zooms 1 à 7, 168 Mo — on ne garde que le **style
postal, zooms 1 à 6** : 5 460 tuiles, 16 Mo.

- **Le style postal** plutôt que satellite : trait clair sur fond sobre, il se marie à
  l'interface et laisse les repères ressortir au lieu de se noyer dans une photo
  aérienne. Il est aussi trois fois plus léger.
- **Pas de zoom 7.** Le `tilemapresource.xml` le dit : le zoom 6 est à *1 unité par
  pixel*, soit la résolution native de la source (16384 × 16384). Le zoom 7 n'est qu'un
  agrandissement 2×, sans un détail de plus — 80 Mo et 16 000 fichiers pour ce que le
  navigateur fait tout seul. D'où `maxNativeZoom: 6` et `maxZoom: 8` côté Leaflet :
  l'agent zoome au-delà, l'image s'agrandit, et rien n'est transporté pour ça.

## Caractéristiques techniques

| | |
| --- | --- |
| Format | WebP, tuiles de 256 × 256 |
| Nommage | `postal/{z}/{x}/{y}.webp` — **XYZ**, pas TMS (engendré avec `gdal2tiles -l`) |
| Profil | `raster` — aucune projection géographique, `CRS.Simple` côté Leaflet |
| Étendue | `x` de 0 à 16384, `y` de -16384 à 0 |
| Zooms | 1 à 6, le 6 étant natif |

`postal/tilemapresource.xml` est conservé : c'est lui qui documente ces bornes.

## Remplacer ce fond

Rien dans l'application ne dépend de ces fichiers : les positions sont stockées
**normalisées entre 0 et 1**. Changer de jeu de tuiles, passer au satellite ou ajouter un
niveau de zoom ne déplace aucun point déjà posé — il suffit de reprendre
`src/composants/carte/fond.ts`.
