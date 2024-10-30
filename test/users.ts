import tap, { Test } from "tap";
import { faker } from "@faker-js/faker";
import { setupFastify, teardownFastify, injectRequest, mockBcryptError, createPayloadUser, createTracker, getDbUser, checkResponseHeader, getResUser } from "./../src/utils/testHelper";

tap.test("POST /users/add route", async (t: Test) => {
  tap.test("success insert new user", async (t: Test) => {
    const fastify = await setupFastify();
    const password = faker.internet.password();
    const userPayload = createPayloadUser(["username", "email", "role_id", "password", "confirm_password"], { password: password, confirm_password: password });
    t.teardown(() => teardownFastify(fastify));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/users/add", userPayload);
    checkResponseHeader(t, response, 201);
    t.equal(parsedPayload.message, "User added successfully");
  });
  tap.test("Validation error", async (t: Test) => {
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify));
    const userPayload = createPayloadUser(["username", "email", "role_id"], { email: faker.internet.userName() });
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/users/add", userPayload);
    checkResponseHeader(t, response, 400);
    t.same(parsedPayload.message, 'must have required property password, must have required property confirm_password, must match format "email"');
    t.same(parsedPayload.errors, [
      { key: "password", value: "must have required property password" },
      { key: "confirm_password", value: "must have required property confirm_password" },
      { key: "email", value: 'must match format "email"' },
    ]);
  });
  tap.test("Validation error password and confirm password didnt match", async (t: Test) => {
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify));
    const userPayload = createPayloadUser(["username", "email", "role_id", "password", "confirm_password"], {});
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/users/add", userPayload);
    checkResponseHeader(t, response, 400);
    t.same(parsedPayload.message, "must be equal to constant");
    t.same(parsedPayload.errors, [{ key: "confirm_password", value: "must be equal to constant" }]);
  });

  tap.test("Error hashing password", async (t: Test) => {
    const fastify = await setupFastify();
    const mockManager = mockBcryptError("hash", "error hash");
    t.teardown(() => teardownFastify(fastify, mockManager));
    const password = faker.internet.password();
    const userPayload = createPayloadUser(["username", "email", "role_id", "password", "confirm_password"], { password: password, confirm_password: password });
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/users/add", userPayload);
    checkResponseHeader(t, response, 500);
    t.same(parsedPayload, {
      statusCode: 500,
      error: "Internal Server Error",
      message: "Error hashing password",
    });
  });
});
tap.test("GET /users/:id route", async (t: Test) => {
  tap.test("success get user detail", async (t: Test) => {
    const fastify = await setupFastify();
    const dbUser = await getDbUser({});
    const resUser = await getResUser(dbUser);
    const tracker = createTracker([dbUser]);
    t.teardown(() => teardownFastify(fastify, undefined, tracker));
    const { response, parsedPayload } = await injectRequest(fastify, "GET", "/users/1");
    checkResponseHeader(t, response, 200);
    t.same(parsedPayload, resUser);
  });
  tap.test("user not found", async (t: Test) => {
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify));
    const { response, parsedPayload } = await injectRequest(fastify, "GET", "/users/1");
    checkResponseHeader(t, response, 404);
    t.equal(parsedPayload.error, "User not found");
  });
});
tap.test("DELETE /users/delete/:id route", async (t: Test) => {
  tap.test("Success to delete a user", async (t: Test) => {
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify));
    const { response, parsedPayload } = await injectRequest(fastify, "DELETE", "/users/delete/1");
    checkResponseHeader(t, response, 200);
    t.same(parsedPayload, { message: "User deleted successfully" });
  });
});
tap.test("PUT /users/:id  route", async (t: Test) => {
  tap.test("Success PUT /users/:id route", async (t: Test) => {
    const password = faker.internet.password();
    const reqUser = createPayloadUser(["username", "email", "role_id", "password", "confirm_password"], { password: password, confirm_password: password });
    const dbUser = await getDbUser(reqUser);
    const resUser = await getResUser(dbUser);
    const fastify = await setupFastify();
    const tracker = createTracker([dbUser]);
    t.teardown(() => teardownFastify(fastify, undefined, tracker));
    const { response, parsedPayload } = await injectRequest(fastify, "PUT", "/users/update/1", reqUser);
    checkResponseHeader(t, response, 200);
    t.same(parsedPayload, {
      message: "User updated successfully",
      user: resUser,
    });
  });
  tap.test("failed PUT /users/:id route", async (t: Test) => {
    const password = faker.internet.password();
    const reqUser = createPayloadUser(["username", "email", "role_id", "password", "confirm_password"], { password: password, confirm_password: password });
    const tracker = createTracker([null]);
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, undefined, tracker));
    const { response, parsedPayload } = await injectRequest(fastify, "PUT", "/users/update/1", reqUser);
    checkResponseHeader(t, response, 200);
    t.same(parsedPayload, {
      message: "User updated successfully",
      user: null,
    });
  });
});
