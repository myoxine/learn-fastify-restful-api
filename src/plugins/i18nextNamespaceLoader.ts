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

  fastify.addHook("onRequest", async (request, reply) => {
    // Mendapatkan URL path tanpa query string
    const urlPath = request.raw.url?.split("?")[0] ?? "";

    // Menghasilkan namespace dari URL, mengganti '/' dengan '.'
    const routeNamespace = urlPath
      .replace(/^\//, "") // Menghilangkan '/' di awal
      .replace(/\//g, "."); // Mengganti '/' dengan '.'

    // Memastikan namespace belum dimuat
    if (!i18next.hasResourceBundle("en", routeNamespace)) {
      try {
        await new Promise<void>((resolve, reject) => {
          i18next.loadNamespaces(routeNamespace, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
        request.log.info(`Namespace ${routeNamespace} berhasil dimuat`);
      } catch (err) {
        request.log.error(`Gagal memuat namespace ${routeNamespace}:`, err);
        return reply.status(500).send({ error: "Namespace loading failed" });
      }
    }
  });

  done();
};

export default fp(i18nextNamespaceLoader);
