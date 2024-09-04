import { FastifyInstance } from "fastify";
import {
  getUserHandler,
  addUserHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../controllers/userController";

export async function userRoutes(server: FastifyInstance) {
  server.get("/:id", getUserHandler);
  server.post("/add", addUserHandler);
  server.put("/update/:id", updateUserHandler);
  server.delete("/delete/:id", deleteUserHandler);
}
