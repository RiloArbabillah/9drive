FROM node:20-alpine AS base

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma

RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build && npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
