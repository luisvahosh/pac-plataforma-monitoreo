FROM node:24-alpine

WORKDIR /app

# Prisma necesita openssl en Alpine.
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 3000

# Aplica migraciones pendientes y arranca la API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
