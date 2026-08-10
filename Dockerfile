# Image de production du front.
#
# Le front n'a pas de couche serveur : il appelle l'API directement depuis le
# navigateur, avec le jeton de l'agent. Ce conteneur ne sert que des fichiers,
# et aucune donnée d'enquête n'y transite.
#
# `NEXT_PUBLIC_API_URL` est lue **à la construction** : elle est inlinée dans le
# bundle. Changer d'URL d'API demande donc de reconstruire l'image, ce qui est
# le prix d'un front sans couche serveur.

FROM node:22-alpine AS construction

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ─────────────────────────────── Exécution ───────────────────────────────

FROM node:22-alpine AS execution

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# La sortie « standalone » embarque le serveur et les seuls modules importés.
COPY --from=construction /app/.next/standalone ./
COPY --from=construction /app/.next/static ./.next/static

USER node

EXPOSE 3001

CMD ["node", "server.js"]
