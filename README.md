# Centrale N&I — interface

Interface du service Narcotics & Investigations de la SAHP. Next.js, TanStack
Query, thème sombre.

L'API vit dans le dépôt `centrale_nai_sahp_back`.

---

## Démarrer

L'API doit tourner d'abord.

```bash
cd ../centrale_nai_sahp_back
docker compose -f docker-compose.dev.yml up -d
```

Puis, ici :

```bash
cp .env.example .env.local
npm install
npm run dev
```

L'interface écoute sur `http://localhost:3001`. Le port n'est pas au hasard :
c'est celui que l'API autorise par défaut dans `CORS_ORIGINES`.

Le premier compte se crée côté back, par la commande d'amorçage :

```bash
npm --prefix ../centrale_nai_sahp_back run agent:super-admin -- 2291 Prénom Nom
```

Elle affiche un mot de passe provisoire, à changer à la première connexion.

---

## Le jeton ne vit qu'en mémoire

Ni `localStorage`, ni `sessionStorage`, ni cookie. **Recharger la page
déconnecte.** Ce n'est pas un défaut : la plateforme se consulte depuis des
postes partagés, où un jeton persisté survivrait à l'agent qui s'en va.

Un `401` sur une route autre que `/auth/*` ferme la session et ramène à l'écran
de connexion, qui explique pourquoi.

---

## Contrat d'API

`openapi.json` est versionné ici et provient du back. Le client typé en dérive :

```bash
npm run contrat     # openapi.json → src/api/contrat.ts
```

`src/api/contrat.ts` est **généré** : ne pas l'éditer. Quand l'API change :

```bash
npm --prefix ../centrale_nai_sahp_back run build
npm --prefix ../centrale_nai_sahp_back run openapi
cp ../centrale_nai_sahp_back/openapi.json .
npm run contrat
```

Versionner `openapi.json` ici rend visible en revue ce qui a changé côté API.
**Le back se déploie avant le front.**

---

## Vérifier

```bash
npm test        # vitest
npm run types   # tsc --noEmit
npm run lint
npm run build
```

---

## Image Docker

Le workflow GitHub Actions construit et pousse l'image front sur GHCR. Le secret
`NEXT_PUBLIC_API_URL` est obligatoire, par exemple
`https://centrale-ni.exemple.fr/api` : cette valeur est inlinée dans le bundle à
la construction.

Le Dockerfile produit une image Next standalone et embarque aussi `public/` pour
les logos et le favicon.

---

## Structure

```
openapi.json             contrat, recopié du back
src/
  api/
    contrat.ts           généré — ne pas éditer
    client.ts            client typé, jeton et détection d'expiration
    erreurs.ts           messages d'API en phrases affichables
  auth/
    session.ts           magasin en mémoire, hors de React
    use-session.ts       hooks de session, connexion, mot de passe
    garde-session.tsx    porte d'entrée des zones
  composants/            coquille, recherche, logo, états vides
  app/
    connexion/           hors coquille
    mot-de-passe/        hors coquille
    (application)/       les cinq zones, sous garde et coquille
    globals.css          jetons du design system
```

Les conventions d'interface et les invariants à respecter sont dans `CLAUDE.md`.

---

## Design system

Thème sombre unique : fond quasi noir, gris froids, une seule teinte d'accent —
un bleu acier repris du métal du badge.

**La couleur est réservée à deux informations**, la fiabilité et la visibilité.
Les jetons sont dans `src/app/globals.css` : familles chaudes pour la fiabilité
(`--fiabilite-1` à `--fiabilite-4`), froides pour la visibilité
(`--visibilite-*`), de sorte que deux échelles présentes sur une même fiche ne
se confondent pas. Une pastille porte toujours son texte : jamais la couleur
seule.

Casse de phrase partout, capitales réservées aux libellés de section. Tout
identifiant — plaque, matricule, numéro de dossier, date technique — porte la
classe `.mono`.
