import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { FastifyPluginOptions } from "fastify";
import knex, { Knex } from "knex";
import { Model } from "objection";
import knexConfig from "./../configs/knexfile";
async function knexPlugin(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
) {
  // Inisialisasi Knex
  const db = knex(knexConfig);

  Model.knex(db);
  // Tambahkan Knex dan Objection ke Fastify
  fastify.decorate("knex", db);
  fastify.decorate("Model", Model);

  // Handle penutupan koneksi database saat Fastify shutdown
  fastify.addHook(
    "onClose",
    (fastifyInstance: FastifyInstance, done: (err?: Error) => void) => {
      fastifyInstance.knex.destroy(done);
    }
  );
}

export default fp(knexPlugin);
