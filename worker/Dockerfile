FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Endurecimiento (Fase 12): correr como usuario no-root.
USER node

CMD ["node", "dist/main.js"]
