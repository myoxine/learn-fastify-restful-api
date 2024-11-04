import { FastifyRequest, FastifyReply } from "fastify";
import {
  authenticateUser,
  generateToken,
  //generateAccessToken,
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
      reply.status(401).send({ error: request.t("auth:login.failed") });
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
      .send({
        message: request.t("auth:login.successed"),
        user,
        token: token.accessToken,
      });
  } catch (error) {
    reply.status(500).send({ error: request.t("auth:login.error") });
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
    reply.status(401).send({ error: request.t("auth:refresh.invalidToken") });
  }
}
export async function logoutHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Mengambil refresh token dari cookie
    const refreshToken = request.server.jwt.lookupToken(request, {
      onlyCookie: true,
    });
 
    // Ambil user dari request (diasumsikan user sudah terautentikasi)
    const user = request.server.user;

    // Hapus refresh token dari Redis
    await request.server.redis.del(`refreshToken:${user.id}-${refreshToken}`);

    // Hapus cookie refresh token
    reply.clearCookie(config.REFRESH_TOKEN_COOKIE_NAME, {
      secure: true, // sesuai konfigurasi cookie sebelumnya
      httpOnly: true,
      sameSite: true,
    });

    reply.code(200).send({ message:  request.t("auth:logout.successed") });
  } catch (error) {
    reply.status(500).send({ error: request.t("auth:logout.failed") });
  }
}
