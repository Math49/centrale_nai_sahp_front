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

**Le front ne détient plus aucun jeton.** Il vit dans un cookie `httpOnly` posé
par l'API, valable une semaine : le navigateur l'envoie seul, et aucun script de
la page ne peut le lire — une faille XSS ne l'exfiltre donc pas.

Le magasin (`src/auth/session.ts`) ne retient que l'identité de l'agent, pour
l'affichage et le masquage des zones. Il n'autorise **jamais** rien : l'API
refuse d'elle-même. Un test verrouille l'invariant — la sérialisation du magasin
ne doit contenir nulle part le mot « jeton ».

Au démarrage, le front ne peut pas savoir s'il a une session, le cookie lui
étant invisible : il le demande par `GET /auth/moi`. C'est `useReprendreSession`,
appelée par le fournisseur racine, et c'est ce qui fait qu'un rechargement ne
déconnecte plus. Le garde attend cette réponse avant de conclure — rediriger
avant renverrait vers la connexion à chaque F5.

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

## Accueil et recherche

`GET /accueil` arrive **assemblé** — signaux, mes dossiers, dernière activité —
pour la même raison que la fiche : les trois blocs dépendent des mêmes règles de
visibilité, et les recomposer ici supposerait la règle en deux exemplaires.

Les signaux **ne sont jamais masqués côté front** : un signal portant sur un
objet inaccessible n'est pas caché, il n'est pas venu. Ne rien ajouter qui
compte, mentionne ou signale ce qui manque.

La famille d'un signal — recoupement, récurrence, vieillissement — se lit en
toutes lettres et **ne se colore pas** : la couleur reste réservée à la
fiabilité et à la visibilité. Une troisième échelle chromatique rendrait les
deux premières illisibles.

La recherche globale ne part qu'à partir de deux caractères, et son état vide
dit ce qu'il a cherché : « rien ne porte ce nom dans ce que vous pouvez
consulter ». Ce que l'agent ne voit pas ne se distingue pas de ce qui n'existe
pas, et c'est voulu.

La recherche de chemin vit dans `src/composants/graphe/chemin.tsx`, partagée
entre l'accueil et le graphe. Ne pas la recopier : deux exemplaires finiraient
par diverger sur ce que veut dire « le plus solide ».

## Graphe — Sigma.js

**Sigma.js sur graphology**, et non plus Cytoscape. La toile charge
`GET /graphe/complet` d'un bloc : toute la matière visible, à toute profondeur.

**Le filtrage passe par les réducteurs, jamais par le graphe.** `nodeReducer`
et `edgeReducer` sont appelés à chaque rendu et décident de l'apparence :
masquer, c'est renvoyer `hidden: true`. Retirer puis remettre des nœuds
relancerait ForceAtlas2 et ferait sauter la carte sous les yeux de l'agent.
Après un changement d'état lu par les réducteurs, appeler
`sigma.refresh({ skipIndexation: true })`.

Le recentrage au clic tient en deux lignes, et c'est le motif documenté :

```ts
const position = sigma.getNodeDisplayData(id);
void sigma.getCamera().animate({ x: position.x, y: position.y, ratio: 0.55 });
```

Le double-clic doit appeler `evenement.preventSigmaDefault()`, sans quoi Sigma
zoome en plus d'ouvrir la fiche.

**Glisser-déposer** — Sigma n'en a pas d'intégré : `downNode` saisit,
`moveBody` déplace via `viewportToGraph`, `upNode`/`upStage` déposent. Deux
pièges, tous deux tenus par le drapeau `glissement` :

- un clic et un glissement commencent **tous deux** par `downNode`. Sans
  distinguer les deux, tout dépôt recentrerait la caméra et arracherait le nœud
  des mains de l'agent ;
- `upNode` précède `clickNode`. Remettre le drapeau à zéro au dépôt rendrait la
  garde du clic inopérante : d'où `vientDeDeposer`, que le clic consomme.

Le dépôt n'est **enregistré que sous la permission** `graphe.repositionner` :
la disposition est partagée par tout le service. Sans elle, l'agent déplace
quand même pour lire sa carte, et le pied de page le dit.

### Piège de coordonnées

Trois repères, à ne pas confondre :

| Méthode | Repère |
| --- | --- |
| `getNodeDisplayData(id)` | **normalisé** `[0,1]` — celui de la caméra |
| `framedGraphToViewport(p)` | normalisé → pixels de l'écran |
| `graphToViewport(p)` | coordonnées **du graphe** → pixels |

`camera.animate()` attend du normalisé, donc `getNodeDisplayData` s'y passe
directement. Pour trouver un nœud à l'écran — un test, une info-bulle — c'est
`framedGraphToViewport` qu'il faut : passer un `DisplayData` à
`graphToViewport` convertit deux fois et vise à côté.

En développement, la toile expose `window.__toile = { sigma, graphe }`. Le rendu
est en WebGL : sans cette poignée, aucun outil du DOM ne peut vérifier une
position de nœud ni rejouer un glissement.

**Deux échelles de couleur, sur deux objets.** Le **nœud** porte la couleur de
son type de donnée — une entorse assumée à la règle, bornée au graphe ; l'**arête**
garde celle de la fiabilité. Sur le même objet elles se disputeraient ; sur deux
objets différents elles se lisent.

Le filtre par nom montre la donnée trouvée **et tout ce qui s'y rattache de
proche en proche** — `ramification()`, extraite dans son propre module parce
qu'elle est la seule vraie logique de l'écran, et testée à part.

La fiche s'ouvre dans un **panneau venant de la droite**, jamais par une
navigation : l'agent regarde une carte, et l'envoyer ailleurs lui ferait perdre
sa position, son filtre et sa mise au point.

## Vocabulaire

Ce que le modèle appelle `entite` s'affiche **« donnée »** dans l'interface.
Les routes, les types du contrat et les identifiants de code gardent leur nom :
seul le mot vu par l'agent change. Renommer le code aurait cassé le contrat
OpenAPI et sa génération, pour un gain nul côté agent.

## Cycle de vie et traçabilité

**Aucun bouton ne dit « supprimer ».** L'infirmation le dit explicitement dans
sa modale — le fait sort du graphe actif et reste consultable dans l'onglet
Historique — et le **motif y est obligatoire** : sans lui, la relecture du
dossier se retrouverait devant une information disparue sans explication.

La fusion se lit dans un seul sens : **la fiche ouverte est absorbée**, celle
qu'on choisit subsiste. L'écran le répète à chaque étape, y compris dans la
modale. Se tromper de côté ne perdrait rien, mais mettrait tout au mauvais
endroit.

Une fiche absorbée n'est pas une impasse : elle porte un bandeau qui **redirige**
vers celle qui subsiste, pour qu'un ancien lien continue de mener quelque part.

Le journal affiche « objet non consultable » lorsque le libellé revient nul :
l'API le résout filtré, et ce qui est masqué pour le lecteur du journal le reste
même dans le journal.

## Pièces jointes

Une image ne s'affiche pas par une URL : la balise `img` ne porte pas le jeton,
et **aucun dossier n'est servi en statique**. L'octet se récupère donc par une
requête authentifiée, puis s'affiche depuis un `blob:` révoqué au démontage.
C'est le prix assumé de la règle, et `useApercuFichier` est le seul endroit qui
le paie.

Le dépôt passe par `bodySerializer` pour rendre le `FormData` tel quel — la
sérialisation JSON par défaut le viderait — et reste dans le client typé, pour
qu'un 401 ferme la session ici comme ailleurs.

L'écran annonce ce que l'API va faire : les formats acceptés, le plafond, et
que **les métadonnées seront retirées**. Le dire est autant une information
qu'une garantie.

## Construction de l'image

`NEXT_PUBLIC_API_URL` est lue **à la construction** et inlinée dans le bundle :
changer d'URL d'API demande de reconstruire l'image. C'est le prix d'un front
sans couche serveur, où aucune donnée d'enquête ne transite par le processus
Next.

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
| 10 — Signaux et accueil (front) | fait |
| 11 — Traçabilité et cycle de vie (front) | fait |
| 12 — Exploitation (front) | fait |

Le lot 6 est **la pièce la plus réutilisée de tout le front** : le moteur de
formulaire dynamique, qui lit le référentiel et produit le formulaire de
n'importe quel type d'entité. Tout le reste en dépend.
