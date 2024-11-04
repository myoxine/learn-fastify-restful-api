import { FastifyInstance } from "fastify";
import {
  loginHandler,
  profileHandler,
  refreshAccessTokenHandler,
} from "../controllers/authController";
import {
  loginSchema,
  profileSchema,
  refreshSchema,
} from "../schemas/authSchema";

export async function authRoutes(server: FastifyInstance) {
  server.post("/login", { schema: loginSchema }, loginHandler);
  server.get(
    "/me",
    { schema: profileSchema, preHandler: [server.authenticate] },
    profileHandler
  );
  server.post(
    "/refresh-token",
    { schema: refreshSchema },
    refreshAccessTokenHandler
  );
}
