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
import i18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import Backend from "i18next-fs-backend";
import i18nextNamespaceLoader from "./plugins/i18nextNamespaceLoader";
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
// Inisialisasi i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en", // Bahasa default
    preload: ["en", "id"], // Bahasa yang akan dimuat
    backend: {
      loadPath: function (lngs: string, namespaces: string) {
        return __dirname + `/locales/${lngs}/${namespaces.replace(".","/")}.json`;
      },
    },
  });

server.register(i18nextMiddleware.plugin, {
  i18next,
});
server.register(i18nextNamespaceLoader, { i18next });
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
  const message = request.t("ping:greeting");
  reply.status(200).send({ message: message });
});
server.ready(async () => {
  try {
    const pong = await server.redis.ping();
    server.log.info("Redis connected! Ping response:" + pong);
  } catch (err) {
    console.error("Redis connection failed:", err);
  }
});

server.listen({ port: parseInt(config.PORT) }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});
