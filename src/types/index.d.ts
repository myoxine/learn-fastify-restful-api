// Definisikan tipe untuk Fastify
import { Model } from "objection";
import type { Knex } from "knex";
import { JWT,FastifyJwtNamespace } from "@fastify/jwt";
import type { UserType } from "src/models/User";
import { onRequestAsyncHookHandler, onRequestHookHandler } from "fastify";
// === method jwt 1
declare module "fastify" {
  interface FastifyInstance  { 
    knex: Knex;
    Model: typeof Model;
    user: UserType;
    jwt:JWT;
    authenticate: preHandlerHookHandler<
      RawServer,
      RawRequest,
      RawReply,
      RouteGeneric,
      ContextConfig,
      NoInfer<SchemaCompiler>,
      TypeProvider,
      Logger
    >;
    redis: fastifyRedis.FastifyRedis
  }
}
