import fastify from "fastify";
import { userRoutes } from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";

const server = fastify({
  ajv: {
    customOptions: {
      allErrors: true,
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
        key: err.params?.missingProperty,
        value: err.message,
      })),
    });
  }
  reply.status(500).send(error);
});

server.register(userRoutes, { prefix: "/users" });
server.register(authRoutes, { prefix: "/auth" });

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
