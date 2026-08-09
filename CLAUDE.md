# Centrale N&I — interface

Dépôt front. L'API vit dans `centrale_nai_sahp_back`.

Documents de référence, dans cet ordre d'autorité : **étude du besoin v1.3**,
**conception technique v1.1**, **plan de lots v1.1**.

---

## La règle d'or, vue du front

> **La base garantit que la donnée ne peut pas devenir incohérente,
> l'application décide qui a le droit de la voir.**

Le front n'est **jamais** le lieu de cette décision. Masquer une zone de
navigation ou un bouton est du confort, pas de la sécurité : chaque route de
l'API refuse d'elle-même ce qu'elle doit refuser, et le front ne connaît pas la
règle des gardiens. C'est pourquoi `GET /entites/:id` renverra la fiche **déjà
assemblée** — l'assembler ici supposerait que la règle existe en deux
exemplaires.

## Les huit invariants

1. **Aucun fait sans source.** Le formulaire ne permet pas d'en créer un sans.
2. **Un lien est une arête unique**, éditable des deux côtés. L'interface doit
   rendre ce comportement explicite au moment où il s'applique : éditer depuis
   la fiche du groupe modifie celle de la personne.
3. **La fiabilité d'un chemin est celle de son maillon le plus faible.**
4. **Seul un super-admin crée des types** d'entités, de liens ou de champs.
5. **La visibilité effective est toujours la plus restrictive applicable.**
6. **Rien n'est jamais supprimé** : archivé, infirmé ou anonymisé. Aucun bouton
   ne dit « supprimer ».
7. **Toute consultation de fiche est journalisée.**
8. **Toute création, modification ou archivage passe par une confirmation
   explicite en modale.** Modale récapitulative pour la création — effets,
   rapprochements détectés, irréversibilité ; modale courte pour le reste.

## Règles d'interface

- **La valeur prime sur ses métadonnées.** Valeur en évidence, pastille de
  fiabilité discrète, source au survol. Jamais l'inverse.
- **Un champ non renseigné reste affiché** : l'absence d'information est une
  information.
- **La couleur est réservée à deux choses** : la fiabilité et la visibilité.
  Partout ailleurs, gris et l'accent unique. Les jetons vivent dans
  `src/app/globals.css` — familles chaudes pour la fiabilité, froides pour la
  visibilité, pour que deux échelles présentes sur une même fiche ne se
  confondent pas.
- **Jamais la couleur seule** : une pastille porte toujours son texte.
- **Casse de phrase partout.** Seuls les libellés de section sont en capitales.
- **Monospace sur tout identifiant** : plaques, matricules, numéros de dossier,
  dates techniques. Classe utilitaire `.mono`.
- **Les onglets débordent en défilement horizontal**, sans repli ni menu.
- **Les compteurs ne comptent que ce que l'agent peut voir.**
- **Les états vides sont des invitations**, avec l'action directement dessous.

## Session

**Le jeton ne vit qu'en mémoire** — ni `localStorage`, ni `sessionStorage`, ni
cookie. Un rechargement déconnecte, et c'est voulu : la plateforme se consulte
depuis des postes partagés, où un jeton persisté survivrait à l'agent parti.

Le magasin (`src/auth/session.ts`) vit hors de React, parce que l'intercepteur
de requêtes doit lire le jeton sans être un composant. React s'y abonne par
`useSyncExternalStore`.

**Un 401 ferme la session**, sauf sur les routes `/auth/*`, qui rendent compte
de leurs propres échecs : un ancien mot de passe erroné ne doit pas déconnecter
l'agent pour une faute de frappe.

## Contrat d'API

`openapi.json` est **versionné dans ce dépôt** et vient du back. Le client typé
en est dérivé :

```bash
npm run contrat     # openapi.json → src/api/contrat.ts
```

`src/api/contrat.ts` est généré : ne jamais l'éditer à la main, il est exclu du
lint. Quand le contrat change, recopier le `openapi.json` du back puis
régénérer. **Le back se déploie avant le front.**

Toute la partie dynamique — types d'entités, champs, types de liens, onglets —
n'est **pas** dans le contrat : elle se récupère par `GET /referentiel` et
alimente le moteur de formulaire dynamique (lot 6).

## Moteur de formulaire dynamique

`src/composants/formulaire/` — la pièce la plus réutilisée du front. Il lit le
référentiel et produit le formulaire de n'importe quel type d'entité.

Quatre règles y sont tenues :

- **L'agent ne trace jamais un lien.** Il remplit un champ relationnel, et
  l'arête existe. Ces champs proposent toujours de sélectionner une fiche
  existante *ou* d'en créer une sur place.
- **Ordre d'écriture imposé.** Une relation où la nouvelle entité est le
  *sujet* part avec sa création ; une relation où elle est la *cible* attend que
  la fiche existe et devient un fait posé ensuite. `planDEcriture()` fait ce
  tri, et c'est là qu'il faut regarder quand un lien part du mauvais côté.
- **Profondeur limitée à deux niveaux.** Au-delà, l'agent enregistre et poursuit
  depuis la fiche créée.
- **Le sous-formulaire est bloquant** : ni le voile ni la touche d'échappement
  ne le referment. On en sort par validation, qui persiste, ou par annulation,
  qui retire ce que la branche a écrit.

L'**enregistrement est progressif** : chaque sous-formulaire validé persiste son
entité. D'où le `RegistreCascade`, tenu à la racine : abandonner une branche
doit pouvoir retirer tout ce qu'elle a écrit, à n'importe quel niveau, et à
rebours — une entité créée plus tard peut désigner une plus ancienne.

Le **bandeau de source active** est figé dans les sous-formulaires : la source
vient du formulaire d'origine et se propage à toute la cascade.

Le **compteur d'impact** reflète l'état réel, pas un total figé à l'ouverture.

## Dossiers

**Ouvrir un dossier revient à ouvrir la fiche de son entité pivot.**
`/dossiers/:id` ne rend rien : elle redirige vers
`/entites/:pivotId?dossier=:id`.

C'est ce paramètre qui fait apparaître le **panneau de dossier**, visible
uniquement lorsqu'on accède à la fiche par cette entrée. La même fiche ouverte
depuis l'annuaire n'en montre rien : le dossier contextualise une consultation,
il ne s'attache pas à l'entité.

La **mention du double rattachement**, elle, s'affiche toujours — une entité
peut appartenir à plusieurs dossiers, et sa fiche le dit quelle que soit la
porte d'entrée.

Le dossier de saisie se propage à toute la cascade du formulaire, comme la
source active : les faits en héritent la visibilité, et l'entité créée entre
dans son suivi.

## Référentiel

`useReferentiel()` met le catalogue en cache **une demi-heure** : il ne bouge
qu'en administration, et toute écriture depuis `src/api/referentiel.ts`
l'invalide. Ne pas le recharger à la main ailleurs.

`liensDisponiblesPour(type, liens)` dit quels types de liens un onglet de ce
type peut regrouper, et dans quel sens. La règle est la même côté API, qui
tranche : le front s'en sert pour ne pas proposer une composition qui sera
refusée, pas pour la garantir.

## Conventions

- **Français partout** : composants, variables, fichiers, commentaires.
  Exception : les propriétés de React et du DOM gardent leur nom anglais
  (`children`, `className`, `onClick`) — ce sont des noms d'API, pas des termes
  du domaine.
- Rendu essentiellement client. Le processus Next ne sert que des fichiers ;
  aucune donnée d'enquête n'y transite.
- Un module CSS par composant, jetons partagés dans `globals.css`.

## Un piège d'outillage

**Ne jamais lancer `npm run build` pendant que `npm run dev` tourne** : les deux
écrivent dans le même `.next`, et le serveur de développement se retrouve avec
des chunks manquants. Les routes statiques n'en souffrent pas, les routes
dynamiques rendent un 500 « Cannot find module ./vendor-chunks/… » qui n'a rien
à voir avec le code. On s'en sort en arrêtant le serveur, en supprimant `.next`,
et en redémarrant.

## Commandes

```bash
npm run dev        # port 3001
npm test           # vitest
npm run types      # tsc --noEmit
npm run lint
npm run contrat    # régénère le client typé
```

## Avancement

| Lot | État |
| --- | --- |
| 2 — Socle front | fait |
| 3 — Référentiel et administration (front) | fait |
| 6 — Moteur de formulaire dynamique | fait |
| 7 — Fiche entité (front) | fait |
| 8 — Dossiers (front) | fait |
| 9 — Graphe (front) | fait |
| 10 — Signaux et accueil (front) | à faire |
| 11 — Traçabilité (front) | à faire |

Le lot 6 est **la pièce la plus réutilisée de tout le front** : le moteur de
formulaire dynamique, qui lit le référentiel et produit le formulaire de
n'importe quel type d'entité. Tout le reste en dépend.
