import tap from "tap";
import { setupFastify, teardownFastify, injectRequest, checkResponseHeader } from "./../src/utils/testHelper";
tap.test("GET `/ping` route", async (t: any) => {
  const fastify = await setupFastify();
  t.teardown(() => teardownFastify(fastify));
  const { response, parsedPayload } = await injectRequest(fastify, "GET", "/ping");
  checkResponseHeader(t,response,200);
  t.same(parsedPayload, { message: "Hello, welcome to our API!" });
});
