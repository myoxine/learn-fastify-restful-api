# Dockerfile untuk aplikasi Fastify
FROM node:23

WORKDIR /app

# Salin file package.json dan install dependencies
COPY package*.json ./
RUN npm install

# Salin semua kode aplikasi
COPY . .

# Install nodemon untuk hot reload
RUN npm install -g nodemon

# Jalankan server Fastify dengan nodemon
CMD ["yarn run dev"]
