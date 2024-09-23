import { FastifyRequest, FastifyReply } from "fastify";
import { authenticateUser, generateToken } from "../services/authService";

// Handle POST /login
export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username, password } = request.body as {
    username: string;
    password: string;
  };

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      reply.status(401).send({ error: "Invalid username or password" });
      return;
    }
    const token = generateToken(request.server, user);
    reply.status(200).send({ message: "Login successful", user, token });
  } catch (error) {
    reply.status(500).send({ error: "Internal Server Error" });
  }
}
// Handle POST /login
export async function profileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.server.user;
  reply.status(200).send(user);
}