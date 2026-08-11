


FROM node:22-alpine AS construction

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build


FROM node:22-alpine AS execution

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0


COPY --from=construction /app/.next/standalone ./
COPY --from=construction /app/.next/static ./.next/static
COPY --from=construction /app/public ./public

USER node

EXPOSE 3001

CMD ["node", "server.js"]
