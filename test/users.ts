import tap from "tap";
import { Test } from "tap/dist/commonjs/main";
import { buildFastify } from "./../src/server";
import { getTracker, QueryDetails } from "mock-knex";

tap.test("POST /users/add route", (t: Test) => {
  t.plan(4);
  const fastify = buildFastify();
  t.teardown(() => fastify.close());
  const payload = {
    username: "user",
    email: "test@aaa.com",
    role_id: 2,
    password: "password",
    confirm_password: "password",
  };
  fastify.inject(
    {
      method: "POST",
      url: "/users/add",
      payload: payload,
    },
    (err: any, response: any) => {
      const responsepayload = JSON.parse(response.payload);
      t.error(err);
      t.equal(response.statusCode, 201);
      t.equal(
        response.headers["content-type"],
        "application/json; charset=utf-8"
      );
      t.equal(responsepayload.message, "User added successfully");
    }
  );
});
tap.test("GET /users/:id route", async (t: Test) => {
  tap.test("success GET /users/:id route", async (t: Test) => {
    t.plan(4);
    const tracker = getTracker();
    tracker.install();
    tracker.on("query", function sendResult(query: QueryDetails) {
      query.response([
        {
          id: 1,
          username: "test",
          email: "test@test.com",
          role_id: 2,
          password: "123456",
        },
      ]);
    });

    const fastify = buildFastify();
    t.teardown(() => {
      tracker.uninstall();
      fastify.close();
    });
    await fastify.ready();
    fastify.inject(
      {
        method: "GET",
        url: `/users/1`,
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, {
          username: "test",
          email: "test@test.com",
          id: 1,
          role_id: 2,
        });
      }
    );
  });

  tap.test("failed GET /users/:id route", async (t: Test) => {
    t.plan(4);

    const fastify = buildFastify();
    t.teardown(() => fastify.close());
    await fastify.ready();
    fastify.inject(
      {
        method: "GET",
        url: `/users/1`,
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);

        t.error(err);
        t.equal(response.statusCode, 404);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.equal(responsepayload.error, "User not found");
      }
    );
  });
});

tap.test("PUT /users/:id route", (t: Test) => {
  t.plan(4);
  const tracker = getTracker();
  tracker.install();
  tracker.on("query", function sendResult(query: QueryDetails) {
    query.response([
      {
        id: 1,
        username: "test",
        email: "test@test.com",
        role_id: 2,
        password: "123456",
      },
    ]);
  });

  const fastify = buildFastify();
  t.teardown(() => {
    tracker.uninstall();
    fastify.close();
  });
  const payload = {
    username: "user",
    email: "test@aaa.com",
    role_id: 2,
    password: "password",
    confirm_password: "password",
  };
  fastify.inject(
    {
      method: "PUT",
      url: "/users/update/1",
      payload: payload,
    },
    (err: any, response: any) => {
      const responsepayload = JSON.parse(response.payload);
      t.error(err);
      t.equal(response.statusCode, 200);
      t.equal(
        response.headers["content-type"],
        "application/json; charset=utf-8"
      );
      t.same(responsepayload, {
        message: "User updated successfully",
        users: {
          username: "test",
          email: "test@test.com",
          role_id: 2,
          password: "123456",
          id: 1,
        },
      });
    }
  );
});