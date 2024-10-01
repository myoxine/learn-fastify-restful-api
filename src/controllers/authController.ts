import { FastifyRequest, FastifyReply } from "fastify";
import {
  authenticateUser,
  generateToken,
  generateAccessToken,
  storeToken,
} from "../services/authService";
import config from "./../utils/config";
import { to_number_of_seconds } from "./../utils/expiry";
import { PublicUserType } from "./../models/User";
// Handle POST /login
export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username, password, remember } = request.body as {
    username: string;
    password: string;
    remember: boolean;
  };

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      reply.status(401).send({ error: "Invalid username or password" });
      return;
    }

    const token = await generateToken(request, user, remember);
    const duration = to_number_of_seconds(
      remember
        ? config.REFRESH_TOKEN_LONG_DURATION
        : config.REFRESH_TOKEN_SHORT_DURATION
    );
    await storeToken(
      request.server,
      token.refreshToken,
      token.accessToken,
      user,
      duration
    );
    reply
      .setCookie(config.REFRESH_TOKEN_COOKIE_NAME, token.refreshToken, {
        secure: true, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true, // alternative CSRF protection
        maxAge: duration,
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

export async function refreshAccessTokenHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Mengambil refresh token dari cookie
    const jwtRequest = await request.jwtVerify<{
      user: PublicUserType;
      remember: boolean;
    }>({
      onlyCookie: true,
    });

    const token = await generateToken(
      request,
      jwtRequest.user,
      jwtRequest.remember
    );
    const duration = to_number_of_seconds(
      jwtRequest.remember
        ? config.REFRESH_TOKEN_LONG_DURATION
        : config.REFRESH_TOKEN_SHORT_DURATION
    );
    await storeToken(
      request.server,
      token.refreshToken,
      token.accessToken,
      jwtRequest.user,
      duration
    );

    reply
      .setCookie(config.REFRESH_TOKEN_COOKIE_NAME, token.refreshToken, {
        secure: true, // send cookie over HTTPS only
        httpOnly: true,
        sameSite: true, // alternative CSRF protection
        maxAge: duration,
      })
      .code(200)
      .send({ token: token.accessToken });
  } catch (error) {
    reply.status(401).send({ error: "Invalid refresh token" });
  }
}
