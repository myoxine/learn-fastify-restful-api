# Dockerfile untuk aplikasi Fastify
FROM node:23

WORKDIR /app

# Salin file package.json dan install dependencies
COPY ./package*.json ./

RUN yarn install

# Salin semua kode aplikasi
COPY . .

# Jalankan server Fastify dengan nodemon
CMD ["yarn", "dev"]


