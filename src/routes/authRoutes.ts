import { FastifyInstance } from "fastify";
import { loginHandler, profileHandler } from "../controllers/authController";
import { loginSchema, profileSchema } from "../schemas/authSchema";

export async function authRoutes(server: FastifyInstance) {
  server.post("/login", { schema: loginSchema }, loginHandler);
  server.get("/me", { schema: profileSchema ,  preHandler: [server.authenticate] }, profileHandler);
}
