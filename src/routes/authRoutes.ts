import { FastifyInstance } from "fastify";
import { loginHandler } from "../controllers/authController";
import { loginSchema } from "../schemas/authSchema";

export async function authRoutes(server: FastifyInstance) {
  server.post("/login", { schema: loginSchema }, loginHandler);
}
