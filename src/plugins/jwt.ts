import fp from "fastify-plugin";
import {
  FastifyPluginOptions,
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import type { PublicUserType } from "./../models/User";
import jwt from "@fastify/jwt";
import config from "../utils/config";
function jwtPlugin(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: any
) {
  fastify.register(jwt, {
    secret: config.SECRET_TOKEN,
    cookie: {
      cookieName: config.REFRESH_TOKEN_COOKIE_NAME,
      signed: false,
    },
  });
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const jwtRequest = await request.jwtVerify<{ user: PublicUserType }>({
          onlyCookie: true,
        });
        const jwtAccess = await request.jwtVerify<{ user: PublicUserType }>();
        if (jwtAccess.user.id === jwtRequest.user.id) {
          const refreshToken = request.server.jwt.lookupToken(request, {
            onlyCookie: true,
          });
          const accessToken = request.server.jwt.lookupToken(request);
          const accessTokenRedis = await fastify.redis.get(
            `refreshToken:${jwtAccess.user.id}-${refreshToken}`
          );
          if (accessToken === accessTokenRedis) {
            request.server.user = jwtAccess.user;
          }else{
            throw new Error("Your token has been expired");

          }
        } else {
          throw new Error("Access token and request token didnt match");
        }
      } catch (err) {
        reply.send(err);
      }
    }
  );
  done();
}
export default fp(jwtPlugin);
