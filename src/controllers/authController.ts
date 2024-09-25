import { FastifyRequest, FastifyReply } from "fastify";
import { authenticateUser, generateToken } from "../services/authService";
import config from "./../utils/config";
import { to_number_of_seconds } from "./../utils/expiry";
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
    const token = await generateToken(request, user);
    reply
      .setCookie(config.REFRESH_TOKEN_COOKIE_NAME, token.refreshToken, {
        secure: true, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true, // alternative CSRF protection
        maxAge: to_number_of_seconds(config.REFRESH_TOKEN_LONG_DURATION),
      })
      .code(200)
      .send({ message: "Login successful", user, token: token.accessToken });
  } catch (error) {
    reply.status(500).send({ error: "Internal Server Error" });
  }
}

export async function profileHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.server.user;
  reply.status(200).send(user);
}
