import tap from "tap";
const { buildFastify } = require("./../src/server");
tap.test("GET `/ping` route", async (t: any) => {
  t.plan(4);
  const fastify = buildFastify();

  // At the end of your tests it is highly recommended to call `.close()`
  // to ensure that all connections to external services get closed.
  t.teardown(() => fastify.close());
  await fastify.ready();
  fastify.inject(
    {
      method: "GET",
      url: "/ping",
    },
    (err: any, response: any) => {
      t.error(err);
      t.equal(response.statusCode, 200);
      t.equal(
        response.headers["content-type"],
        "application/json; charset=utf-8"
      );
      t.same(JSON.parse(response.payload), { message: "Hello, welcome to our API!" });
    }
  );
});
