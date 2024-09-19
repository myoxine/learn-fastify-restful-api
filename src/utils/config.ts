import envSchema from "env-schema";
import { FromSchema } from "json-schema-to-ts";
const schema = {
  type: "object",
  required: ["PORT", "LOG_LEVEL", "NODE_ENV","SALT_ROUNDS_PASSWORD"],
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
      enum: ["debug", "info", "warn", "error",""],
      default: "info",
    }, // Tambahkan FILE_LOG_LEVEL
    SALT_ROUNDS_PASSWORD:{
      type: "number",
      minimum:1,
      maximum:10,
      default: "info",
    }
  },
} as const;
type schemaType = FromSchema<typeof schema>;
const config = envSchema<schemaType>({
  schema: schema,
  dotenv: true, // load .env if it is there, default: false
});
export default config;
