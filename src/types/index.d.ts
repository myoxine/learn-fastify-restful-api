// Definisikan tipe untuk Fastify
import { Model } from "objection";
import type { Knex } from "knex";
import { JWT } from '@fastify/jwt'
import type {UserType} from "src/models/User";
import { onRequestAsyncHookHandler, onRequestHookHandler } from "fastify";
declare module "fastify" {
  interface FastifyInstance {
    knex: Knex;
    Model: typeof Model;
    jwt: JWT;
    user:UserType;
    authenticate:preHandlerHookHandler<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig, NoInfer<SchemaCompiler>, TypeProvider, Logger>;
  }
}
