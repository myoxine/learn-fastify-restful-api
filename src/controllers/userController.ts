import { FastifyRequest, FastifyReply } from "fastify";
import {
  getUserById,
  addUser,
  updateUser,
  deleteUser,
} from "../services/userService";

import type { UserType } from "./../models/User";

// Handle GET /users/:id
interface GetUserParams {
  id: string;
}

export async function getUserHandler(
  request: FastifyRequest<{ Params: GetUserParams }>,
  reply: FastifyReply
) {
  const id = request.params.id as unknown as number;
  const user = await getUserById(id);
  if (!user) {
    reply.status(404).send({ error: request.t("users:get.error") });
    return;
  }
  reply.status(200).send(user);
}

// Handle POST /add
// interface AddUserBody {
//   name: string;
//   age: number;
// }

export async function addUserHandler(
  request: FastifyRequest<{ Body: UserType }>,
  reply: FastifyReply
) {
  const newUser = await addUser(request.body);
  reply
    .status(201)
    .send({ message: request.t("users:add.successed"), users: newUser });
}

// Handle PUT /update/:id
interface UpdateUserParams {
  id: string;
}

export async function updateUserHandler(
  request: FastifyRequest<{ Body: UserType; Params: UpdateUserParams }>,
  reply: FastifyReply
) {
  const id = request.params.id as unknown as number;
  const updatedUser = await updateUser(id, request.body);

  reply
    .status(200)
    .send({ message: request.t("users:update.successed"), users: updatedUser });
}

// Handle DELETE /delete/:id
interface DeleteUserParams {
  id: string;
}
export async function deleteUserHandler(
  request: FastifyRequest<{ Params: DeleteUserParams }>,
  reply: FastifyReply
) {
  const id = request.params.id as unknown as number;
  await deleteUser(id);
  reply.status(200).send({ message: request.t("users:delete.successed") });
}
