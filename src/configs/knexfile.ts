import type { Knex } from "knex";
import configApp from "../utils/config";
// Update with your config settings.

const config: Knex.Config = {
  client: configApp.KNEX_CLIENT,
  connection: {
    database: configApp.KNEX_CONNECTION_DATABASE,
    user: configApp.KNEX_CONNECTION_USER,
    password: configApp.KNEX_CONNECTION_PASSWORD,
  },
  pool: {
    min: configApp.KNEX_POOL_MIN,
    max: configApp.KNEX_POOL_MAX,
  },
  migrations: {
    tableName: configApp.KNEX_MIGRATIONS_TABLENAME,
    directory: "./../migrations",
  },
  seeds: {
    directory: "./../seeds",
  },
};

export default config;
