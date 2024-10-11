import { FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import i18next from "i18next";

interface I18nextNamespaceLoaderOptions {
  i18next: typeof i18next;
}

const i18nextNamespaceLoader: FastifyPluginCallback<
  I18nextNamespaceLoaderOptions
> = (fastify, options, done) => {
  const { i18next } = options;
  fastify.addHook("preValidation", async (request, reply) => {
    const urlPath = request.url;
    const routeNamespace = urlPath.replace(/^\//, "").replace(/\//g, ".");
    if (!i18next.hasLoadedNamespace(routeNamespace)) {
      try {
        await new Promise<void>((resolve, reject) => {
          i18next.loadNamespaces(routeNamespace, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
        request.log.info(`Namespace ${routeNamespace} berhasil dimuat`);
      } catch (err: any) {
        console.log(err);
        request.log.error(
          `Gagal memuat namespace ${routeNamespace}:`,
          err.message
        );
        return reply.status(500).send({ error: "Namespace loading failed" });
      }
    }
  });

  done();
};

export default fp(i18nextNamespaceLoader);
