// Definisikan tipe untuk Fastify
import { Model } from "objection";
import type { Knex } from "knex";
declare module "fastify" {
  interface FastifyInstance {
    knex: Knex;
    Model: typeof Model;
  }
}
