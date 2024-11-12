# Tahap Build
FROM node:23 AS build
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn run build

# Tahap Production
FROM node:23-slim
WORKDIR /app

# Salin hanya file yang diperlukan untuk aplikasi
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/

# Install hanya dependensi untuk production
RUN yarn install --production=true

# Salin konfigurasi environment untuk production
COPY .env.production .env.production
CMD ["yarn","start"]
