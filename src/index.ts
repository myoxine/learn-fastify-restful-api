import fastify from "fastify";
import { userRoutes } from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";
import loggerConfig from "./configs/logger";
import config from "./utils/config";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import knexPlugin from "./plugins/knex";
import jwtPlugin from "./plugins/jwt";
import cookie from "@fastify/cookie";
import fastifyRedis from "@fastify/redis";
const server = fastify({
  logger: loggerConfig,
  ajv: {
    customOptions: {
      $data: true,
      allErrors: true,
      keywords: [
        {
          keyword: "exclusiveRange",
          type: "number",
        },
        {
          keyword: "range",
          type: "number",
          compile([min, max], parentSchema) {
            return parentSchema.exclusiveRange === true
              ? (data) => data > min && data < max
              : (data) => data >= min && data <= max;
          },
          errors: false,
          metaSchema: {
            // schema to validate keyword value
            type: "array",
            items: [{ type: "number" }, { type: "number" }],
            minItems: 2,
            additionalItems: false,
          },
        },
      ],
      formats: {
        phoneNumber: {
          type: "string",
          validate: (value) => {
            const phoneRegex = /^[0-9]{10,15}$/; // Misal, validasi nomor telepon hanya angka 10-15 digit
            return phoneRegex.test(value);
          },
        },
      },
    },
    plugins: [require("ajv-errors")],
  },
});

const swaggerOptions = {
  swagger: {
    info: {
      title: "My Title",
      description: "My Description.",
      version: "1.0.0",
    },
    host: "localhost",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [{ name: "Default", description: "Default" }],
  },
};

const swaggerUiOptions = {
  routePrefix: "/docs",
  exposeRoute: true,
};
server.register(knexPlugin);
server.register(jwtPlugin);
server.register(cookie, {
  secret: config.SECRET_COOKIE, // Secret to sign cookies (if needed)
});
// Register Redis plugin
server.register(fastifyRedis, {
  host: config.REDIS_HOST, // ganti ini kalau pakai Docker atau Redis di server lain
  port: parseInt(config.REDIS_PORT),
});
server.setErrorHandler(function (error, request, reply) {
  if (error.validation) {
    return reply.status(400).send({
      path: request.url,
      status: error.statusCode,
      timestamp: Date.now(),
      message: error.message,
      errors: error.validation.map((err) => ({
        key:
          err.params?.missingProperty ||
          err.instancePath.replace(new RegExp("/", "g"), ""),
        value: err.message,
      })),
    });
  }
  reply.status(500).send(error);
});

server.register(fastifySwagger, swaggerOptions);
server.register(fastifySwaggerUi, swaggerUiOptions);
server.register(userRoutes, { prefix: "/users" });
server.register(authRoutes, { prefix: "/auth" });

server.get("/ping", async (request, reply) => {
  request.log.info("Ada request baru nih!"); // Mencatat log info
  return "pong\n";
});
server.ready(async () => {
  try {
    const pong = await server.redis.ping();
    server.log.info("Redis connected! Ping response:" + pong);
  } catch (err) {
    server.log.info("Redis connection failed:", err);
  }
});

server.listen({ port: parseInt(config.PORT) }, (err, address) => {
  if (err) {
    server.log.info(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});