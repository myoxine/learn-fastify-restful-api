import { FastifyRequest, FastifyReply } from "fastify";
import {
  getUserById,
  addUser,
  updateUser,
  deleteUser,
} from "../services/userService";

// Handle GET /users/:id
interface GetUserParams {
  id: string;
}

export async function getUserHandler(
  request: FastifyRequest<{ Params: GetUserParams }>,
  reply: FastifyReply
) {
  const userId = request.params.id;
  const user = await getUserById(userId);

  if (!user) {
    reply.status(404).send({ error: "User not found" });
    return;
  }

  reply.status(200).send(user);
}

// Handle POST /add
interface AddUserBody {
  name: string;
  age: number;
}

export async function addUserHandler(
  request: FastifyRequest<{ Body: AddUserBody }>,
  reply: FastifyReply
) {
  const { name, age } = request.body;
  const user = await addUser(name, age);

  reply.status(201).send({ message: "User added successfully", user });
}

// Handle PUT /update/:id
interface UpdateUserParams {
  id: string;
}
interface UpdateUserBody {
  name: string;
  age: number;
}
export async function updateUserHandler(
  request: FastifyRequest<{ Body: UpdateUserBody; Params: UpdateUserParams }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  const { name, age } = request.body;
  const updatedUser = await updateUser(id, name, age);

  reply
    .status(200)
    .send({ message: "User updated successfully", user: updatedUser });
}

// Handle DELETE /delete/:id
interface DeleteUserParams {
  id: string;
}
export async function deleteUserHandler(
  request: FastifyRequest<{ Params: DeleteUserParams }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  await deleteUser(id);

  reply.status(200).send({ message: "User deleted successfully" });
}
