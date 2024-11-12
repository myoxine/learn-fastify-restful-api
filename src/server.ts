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
import I18next from "i18next";
import i18nextMiddleware from "i18next-http-middleware";
import Backend from "i18next-fs-backend";
import errorsText from "./utils/errorsText";
import translateAjvErrors from "./utils/translateAjvErrors";

export function buildFastify() {
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
          // {
          //   keyword: "range",
          //   type: "number",
          //   compile([min, max], parentSchema) {
          //     return parentSchema.exclusiveRange === true
          //       ? (data) => data > min && data < max
          //       : (data) => data >= min && data <= max;
          //   },
          //   errors: false,
          //   metaSchema: {
          //     // schema to validate keyword value
          //     type: "array",
          //     items: [{ type: "number" }, { type: "number" }],
          //     minItems: 2,
          //     additionalItems: false,
          //   },
          // },
        ],
        formats: {
          /*
          phoneNumber: {
            type: "string",
            validate: (value) => {
              const phoneRegex = /^[0-9]{10,15}$/; // Misal, validasi nomor telepon hanya angka 10-15 digit
              return phoneRegex.test(value);
            },
          },
          */
        },
      },
      plugins: [require("ajv-errors")],
    },
  });
  // Inisialisasi i18next
  const i18next = I18next.createInstance();
  i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      debug: false,
      initImmediate: false,
      fallbackLng: "en", // Bahasa default
      preload: ["en", "id"], // Bahasa yang akan dimuat
      ns: ["ping", "auth", "users"],
      backend: {
        loadPath: function (lngs: string, namespaces: string) {
          return (
            __dirname + `/locales/${lngs}/${namespaces.replace(".", "/")}.json`
          );
        },
      },
    });

  // server.register(i18nextMiddleware.plugin, {
  //   i18next,
  // });
  server.addHook(
    "preValidation",
    i18nextMiddleware.handle(i18next, {
      ignoreRoutes: [], // or function(req, res, options, i18next) { /* return true to ignore */ }
    })
  );

  /*server.register(i18nextNamespaceLoader, { i18next });*/
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
  /* c8 ignore start */
  server.register(
    config.NODE_ENV === "test"
      ? require("fastify-redis-mock")
      : require("@fastify/redis"),
    {
      host: config.REDIS_CACHE_HOST, // ganti ini kalau pakai Docker atau Redis di server lain
      port: config.REDIS_CACHE_PORT,
      password: config.REDIS_CACHE_PASSWORD
    }
  );
/* c8 ignore end */
  server.register(fastifySwagger, swaggerOptions);
  server.register(fastifySwaggerUi, swaggerUiOptions);
  server.register(userRoutes, { prefix: "/users" });
  server.register(authRoutes, { prefix: "/auth" });

  server.get("/ping", async (request, reply) => {
    const message = request.t("ping:greeting");
    reply.status(200).send({ message: message });
  });
  server.setErrorHandler(function (error, request, reply) {
    if (error.validation) {
      translateAjvErrors(request.language, error.validation);
      return reply.status(400).send({
        path: request.url,
        status: error.statusCode,
        timestamp: Date.now(),
        message: errorsText(error.validation),
        errors: error.validation.map((err) => ({
          key:
            err.params && err.params.missingProperty
              ? err.params.missingProperty
              : err.instancePath.replace(new RegExp("/", "g"), ""),
          value: err.message,
        })),
      });
    }
    reply.status(500).send(error);
  });

  return server; // Kembalikan instance server
}
