import envSchema from "env-schema";
import { FromSchema } from "json-schema-to-ts";
const schema = {
  type: "object",
  required: [
    "PORT",
    "LOG_LEVEL",
    "NODE_ENV",
    "KNEX_CLIENT" ,
    "KNEX_CONNECTION_HOST", 
    "KNEX_CONNECTION_PORT",    
    "SALT_ROUNDS_PASSWORD",
    "SECRET_TOKEN",
    "SECRET_COOKIE",
    "ACCESS_TOKEN_SHORT_DURATION",
    "ACCESS_TOKEN_LONG_DURATION",
    "REFRESH_TOKEN_SHORT_DURATION",
    "REFRESH_TOKEN_LONG_DURATION",
    "REFRESH_TOKEN_COOKIE_NAME",
    "REDIS_CACHE_HOST",
    "REDIS_CACHE_PORT",
    "REDIS_CACHE_PASSWORD"
  ],
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
    SALT_ROUNDS_PASSWORD: {
      type: "number",
      minimum: 1,
      maximum: 10,
      default: "info",
    },
    SECRET_TOKEN: {
      type: "string",
    },
    SECRET_COOKIE: {
      type: "string",
    },
    ACCESS_TOKEN_LONG_DURATION: {
      type: "string",
    },
    ACCESS_TOKEN_SHORT_DURATION: {
      type: "string",
    },
    REFRESH_TOKEN_LONG_DURATION: {
      type: "string",
    },
    REFRESH_TOKEN_SHORT_DURATION: {
      type: "string",
    },
    REFRESH_TOKEN_COOKIE_NAME: {
      type: "string",
    },
    REDIS_CACHE_HOST: {
      type: "string",
      default: "127.0.0.1",
    },
    REDIS_CACHE_PORT: {
      type: "number",
      default: 6379,
    },
    REDIS_CACHE_PASSWORD: {
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
