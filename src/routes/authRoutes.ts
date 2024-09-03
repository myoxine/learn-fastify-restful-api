import { FastifyInstance } from "fastify";
import { loginHandler } from "../controllers/authController";

export async function authRoutes(server: FastifyInstance) {
  server.post("/login", loginHandler);
}
