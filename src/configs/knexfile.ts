import type { Knex } from "knex";

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "postgres",
    connection: {
      database: "learn_fastify",
      user: "postgres",
      password: "1234567"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './../migrations'
    },
    seeds: {
      directory: './../seeds'
    }
  },
  staging: {
    client: "mysql",
    connection: {
      database: "learn_fastify",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './../migrations'
    },
    seeds: {
      directory: './../seeds'
    }
  },

  production: {
    client: "mysql",
    connection: {
      database: "learn_fastify",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations",
      directory: './../migrations'
    },
    seeds: {
      directory: './../seeds'
    }
  }

};

export default config;
