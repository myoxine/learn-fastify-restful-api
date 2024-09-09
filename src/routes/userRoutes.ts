import { FastifyInstance } from "fastify";
import {
  getUserHandler,
  addUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../controllers/userController";
import {
  addUserSchema,
  deleteUserSchema,
  getUserSchema,
  updateUserSchema,
} from "../schemas/usersSchema";

export async function userRoutes(server: FastifyInstance) {
  server.get("/:id", { schema: getUserSchema }, getUserHandler);
  server.post("/add", { schema: addUserSchema }, addUserHandler);
  server.put("/update/:id", { schema: updateUserSchema }, updateUserHandler);
  server.delete("/delete/:id", { schema: deleteUserSchema }, deleteUserHandler);
}
