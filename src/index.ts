import fastify from "fastify";
import { userRoutes } from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";

const server = fastify({
  logger: {
    level: "info",
    transport: {
      targets: [
        {
          target: "pino-pretty",
          level: "info",
          options: {
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        },
        {
          target: "pino/file",
          level: "info",
          options: { destination: './logs' }, // this writes to STDOUT
        },
      ],
    },
  },
  ajv: {
    customOptions: {
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

server.register(userRoutes, { prefix: "/users" });
server.register(authRoutes, { prefix: "/auth" });

server.get("/ping", async (request, reply) => {
  request.log.info("Ada request baru nih!"); // Mencatat log info
  return "pong\n";
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
