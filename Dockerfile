


FROM node:22-alpine AS construction

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

RUN npm run build


FROM node:22-alpine AS execution

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=40510
ENV HOSTNAME=0.0.0.0


COPY --from=construction /app/.next/standalone ./
COPY --from=construction /app/.next/static ./.next/static
COPY --from=construction /app/public ./public

USER node

EXPOSE 40510

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
