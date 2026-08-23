FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Endurecimiento (Fase 12): correr como usuario no-root.
USER node

EXPOSE 4173

# Sirve el build estático. Caddy hace de reverse proxy hacia este servicio.
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
