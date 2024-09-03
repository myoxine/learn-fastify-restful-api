import fastify from "fastify";
import { userRoutes } from "./routes/userRoutes";
import { authRoutes } from "./routes/authRoutes";

const server = fastify();

server.register(userRoutes);
server.register(authRoutes);

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