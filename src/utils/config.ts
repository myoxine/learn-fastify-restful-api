import envSchema from "env-schema";
import { FromSchema } from "json-schema-to-ts";
const schema = {
  type: "object",
  required: ["PORT", "LOG_LEVEL", "NODE_ENV", "KNEX_CONNECTION_HOST", "KNEX_CONNECTION_PORT"],
  properties: {
    PORT: {
      type: "string",
      default: 3000,
    },
    NODE_ENV: {
      type: "string",
      enum: ["development", "production", "test"],
      default: "info",
    }, // Tambahkan NODE_ENV
    LOG_LEVEL: {
      type: "string",
      enum: ["debug", "info", "warn", "error"],
      default: "info",
    }, // Tambahkan LOG_LEVEL
    FILE_LOG_LEVEL: {
      type: "string",
      enum: ["debug", "info", "warn", "error", ""],
      default: "info",
    }, // Tambahkan FILE_LOG_LEVEL
    KNEX_CLIENT: {
      type: "string",
      default: "postgres",
    },
    KNEX_CONNECTION_HOST: {
      type: "string",
    },
    KNEX_CONNECTION_PORT: {
      type: "number",
    },
    KNEX_CONNECTION_DATABASE: {
      type: "string",
    },
    KNEX_CONNECTION_USER: {
      type: "string",
    },
    KNEX_CONNECTION_PASSWORD: {
      type: "string",
    },
    KNEX_POOL_MIN: {
      type: "number",
    },
    KNEX_POOL_MAX: {
      type: "number",
    },
    KNEX_MIGRATIONS_TABLENAME: {
      type: "string",
    },
  },
} as const;

type schemaType = FromSchema<typeof schema>;
const config = envSchema<schemaType>({
  schema: schema,
  dotenv: {
    path: `${__dirname}/../../.env.${process.env.NODE_ENV}`,
  }, // load .env if it is there, default: false
});
export default config;
