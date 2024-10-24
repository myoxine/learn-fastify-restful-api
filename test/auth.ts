import tap from "tap";
import { Test } from "tap/dist/commonjs/main";
import { buildFastify } from "./../src/server";
import { getTracker, QueryDetails } from "mock-knex";
import { hashPassword } from "./../src/utils/encrypt";
import { storeToken } from "./../src/services/authService";
import { to_number_of_seconds } from "./../src/utils/expiry";
import { ImportMock } from "ts-mock-imports";
import * as authService from "./../src/services/authService";
import bcrypt from "bcrypt";

tap.test("POST /auth/logout route", async (t: Test) => {
  tap.test("Error POST /auth/logout route", async (t: Test) => {
    t.plan(4);
    const fastify = buildFastify();
    await fastify.ready();
    const mockManager = ImportMock.mockOther(fastify.redis, "del", () => {
      throw new Error("aaa");
    });
    t.teardown(() => {
      fastify.close();
      mockManager.restore();
    });
    const duration = to_number_of_seconds("1d");
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: true },
      { expiresIn: "1d" }
    );
    storeToken(fastify, refreshToken, accessToken, user, duration);

    fastify.inject(
      {
        method: "POST",
        url: `/auth/logout`,
        cookies: {
          refreshToken: refreshToken,
        },
        headers: { authorization: `Bearer ${accessToken}` },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 500);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, { error: "Failed to logout" });
        // t.equal(!responsepayload.token, false);
      }
    );
  });

  tap.test("success POST /auth/logout route", async (t: Test) => {
    t.plan(4);
    const fastify = buildFastify();
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    const duration = to_number_of_seconds("1d");
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: true },
      { expiresIn: "1d" }
    );
    storeToken(fastify, refreshToken, accessToken, user, duration);

    fastify.inject(
      {
        method: "POST",
        url: `/auth/logout`,
        cookies: {
          refreshToken: refreshToken,
        },
        headers: { authorization: `Bearer ${accessToken}` },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, { message: "Logout successful" });
        // t.equal(!responsepayload.token, false);
      }
    );
  });
});

tap.test("POST /auth/refresh route", async (t: Test) => {
  tap.test("Error POST /auth/refresh route", async (t: Test) => {
    t.plan(4);
    const mockManager = ImportMock.mockOther(
      authService,
      "generateToken",
      () => {
        throw new Error("aaa");
      }
    );

    const fastify = buildFastify();
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    t.teardown(() => {
      fastify.close();
      mockManager.restore();
    });
    await fastify.ready();

    const duration = to_number_of_seconds("1d");
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: true },
      { expiresIn: "1d" }
    );
    storeToken(fastify, refreshToken, accessToken, user, duration);

    fastify.inject(
      {
        method: "POST",
        url: `/auth/refresh-token`,
        cookies: {
          refreshToken: refreshToken,
        },
        headers: { authorization: `Bearer ${accessToken}` },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 401);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, { error: "Invalid refresh token" });
        // t.equal(!responsepayload.token, false);
      }
    );
  });
  tap.test("success 1 POST /auth/refresh route", async (t: Test) => {
    t.plan(4);
    const fastify = buildFastify();
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    const duration = to_number_of_seconds("1d");
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: true },
      { expiresIn: "1d" }
    );
    storeToken(fastify, refreshToken, accessToken, user, duration);

    fastify.inject(
      {
        method: "POST",
        url: `/auth/refresh-token`,
        cookies: {
          refreshToken: refreshToken,
        },
        headers: { authorization: `Bearer ${accessToken}` },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.equal(!responsepayload.token, false);
      }
    );
  });
  tap.test("success 2 POST /auth/refresh route", async (t: Test) => {
    t.plan(4);
    const fastify = buildFastify();
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    const duration = to_number_of_seconds("1d");
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: false },
      { expiresIn: "1d" }
    );
    storeToken(fastify, refreshToken, accessToken, user, duration);

    fastify.inject(
      {
        method: "POST",
        url: `/auth/refresh-token`,
        cookies: {
          refreshToken: refreshToken,
        },
        headers: { authorization: `Bearer ${accessToken}` },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 200);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.equal(!responsepayload.token, false);
      }
    );
  });
});
tap.test("GET /auth/me route", async (t: Test) => {
  tap.test("failed 1 GET /auth/me route", async (t: Test) => {
    t.plan(4);
    const fastify = buildFastify();
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    const duration = to_number_of_seconds("1d");
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: true },
      { expiresIn: "1d" }
    );

    storeToken(fastify, refreshToken, accessToken, user, duration);

    const user2 = {
      id: 2,
      username: "user2",
      email: "test2@aaa.com",
      role_id: 2,
      password: "password",
    };
    const accessToken2 = fastify.jwt.sign(
      { user: user2 },
      { expiresIn: "15m" }
    );
    const refreshToken2 = fastify.jwt.sign(
      { user: user2, remember: true },
      { expiresIn: "1d" }
    );

    fastify.inject(
      {
        method: "GET",
        url: `/auth/me`,
        cookies: {
          refreshToken: refreshToken,
        },
        headers: { authorization: `Bearer ${accessToken2}` },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 500);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, {
          statusCode: 500,
          error: "Internal Server Error",
          message: "Access token and request token didnt match",
        });
      }
    );
  });
  tap.test("failed 2 GET /auth/me route", async (t: Test) => {
    t.plan(4);
    const fastify = buildFastify();
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    const duration = to_number_of_seconds("1d");
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: true },
      { expiresIn: "1d" }
    );

    storeToken(fastify, refreshToken, accessToken, user, duration);

    const user2 = {
      id: 2,
      username: "user2",
      email: "test2@aaa.com",
      role_id: 2,
      password: "password",
    };
    const accessToken2 = fastify.jwt.sign(
      { user: user2 },
      { expiresIn: "15m" }
    );
    const refreshToken2 = fastify.jwt.sign(
      { user: user2, remember: true },
      { expiresIn: "1d" }
    );

    fastify.inject(
      {
        method: "GET",
        url: `/auth/me`,
        cookies: {
          refreshToken: refreshToken2,
        },
        headers: { authorization: `Bearer ${accessToken2}` },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 500);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, {
          statusCode: 500,
          error: "Internal Server Error",
          message: "Your token has been expired",
        });
      }
    );
  });

  tap.test("success GET /auth/me route", async (t: Test) => {
    t.plan(4);
    const fastify = buildFastify();
    const user = {
      id: 1,
      username: "user",
      email: "test@aaa.com",
      role_id: 2,
      password: "password",
    };
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    const duration = to_number_of_seconds("1d");
    const accessToken = fastify.jwt.sign({ user }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign(
      { user, remember: true },
      { expiresIn: "1d" }
    );
    storeToken(fastify, refreshToken, accessToken, user, duration);

    fastify.inject(
      {
        method: "GET",
        url: `/auth/me`,
        cookies: {
          refreshToken: refreshToken,
        },
        headers: { authorization: `Bearer ${accessToken}` },
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
          username: "user",
          email: "test@aaa.com",
          id: 1,
          role_id: 2,
        });
      }
    );
  });
});
tap.test("POST /auth/login route", async (t: Test) => {
  tap.test("error POST /auth/login route", async (t: Test) => {
    t.plan(4);
    const mockManager = ImportMock.mockOther(bcrypt, "compare", () => {
        throw new Error("aaa");
      });
    const tracker = getTracker();
    tracker.install();
    tracker.on("query", async function sendResult(query: QueryDetails) {
      const password = await hashPassword("123456");
      query.response([
        {
          id: 1,
          username: "test",
          email: "test@test.com",
          role_id: 2,
          password: password,
        },
      ]);
    });

    const fastify = buildFastify();
    t.teardown(() => {
      tracker.uninstall();
      fastify.close();
      mockManager.restore();
    });
    await fastify.ready();
    const payload = {
      username: "test",
      password: "123456",
      remember: true,
    };
    fastify.inject(
      {
        method: "POST",
        url: "/auth/login",
        payload: payload,
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 500);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, { error: 'Internal Server Error' });
      }
    );
  });
  tap.test("failed POST /auth/login route", async (t: Test) => {
    t.plan(4);
    const tracker = getTracker();
    tracker.install();
    tracker.on("query", async function sendResult(query: QueryDetails) {
      const password = await hashPassword("123456");
      query.response([
        {
          id: 1,
          username: "test",
          email: "test@test.com",
          role_id: 2,
          password: password,
        },
      ]);
    });
    const mockManager = ImportMock.mockOther(
      authService,
      "generateToken",
      () => {
        throw new Error("aaa");
      }
    );

    const fastify = buildFastify();
    //const fastify = buildFastify();
    t.teardown(() => {
      tracker.uninstall();
      fastify.close();
      mockManager.restore();
    });
    await fastify.ready();
    const payload = {
      username: "test",
      password: "123456",
      remember: true,
    };
    fastify.inject(
      {
        method: "POST",
        url: "/auth/login",
        payload: payload,
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 500);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, { error: "Internal Server Error" });
      }
    );
  });
  tap.test("failed 2 POST /auth/login route", async (t: Test) => {
    t.plan(5);
    const fastify = buildFastify();
    //const fastify = buildFastify();
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    fastify.inject(
      {
        method: "POST",
        url: "/auth/login",
        payload: {},
        headers: { "accept-language": "id" },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 400);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.equal(
          responsepayload.message,
          "harus memiliki properti username, harus memiliki properti password, harus memiliki properti remember"
        );
        t.same(responsepayload.errors, [
          { key: "username", value: "harus memiliki properti username" },
          { key: "password", value: "harus memiliki properti password" },
          { key: "remember", value: "harus memiliki properti remember" },
        ]);
      }
    );
  });

  tap.test("failed 3 POST /auth/login route", async (t: Test) => {
    t.plan(5);
    const fastify = buildFastify();
    //const fastify = buildFastify();
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();

    fastify.inject(
      {
        method: "POST",
        url: "/auth/login",
        payload: {},
        headers: { "accept-language": "en" },
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 400);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.equal(
          responsepayload.message,
          "must have required property username, must have required property password, must have required property remember"
        );
        t.same(responsepayload.errors, [
          { key: "username", value: "must have required property username" },
          { key: "password", value: "must have required property password" },
          { key: "remember", value: "must have required property remember" },
        ]);
      }
    );
  });
  tap.test("failed user not found POST /auth/login route", async (t: Test) => {
    t.plan(4);

    const fastify = buildFastify();
    t.teardown(() => {
      fastify.close();
    });
    await fastify.ready();
    const payload = {
      username: "test",
      password: "123456",
      remember: true,
    };
    fastify.inject(
      {
        method: "POST",
        url: "/auth/login",
        payload: payload,
      },
      (err: any, response: any) => {
        const responsepayload = JSON.parse(response.payload);
        t.error(err);
        t.equal(response.statusCode, 401);
        t.equal(
          response.headers["content-type"],
          "application/json; charset=utf-8"
        );
        t.same(responsepayload, { error: "Invalid username or password" });
      }
    );
  });

  tap.test(
    "failed password not match POST /auth/login route",
    async (t: Test) => {
      t.plan(4);
      const tracker = getTracker();
      tracker.install();
      tracker.on("query", async function sendResult(query: QueryDetails) {
        const password = await hashPassword("1234567");
        query.response([
          {
            id: 1,
            username: "test",
            email: "test@test.com",
            role_id: 2,
            password: password,
          },
        ]);
      });

      const fastify = buildFastify();
      t.teardown(() => {
        tracker.uninstall();
        fastify.close();
      });
      await fastify.ready();
      const payload = {
        username: "test",
        password: "123456",
        remember: true,
      };
      fastify.inject(
        {
          method: "POST",
          url: "/auth/login",
          payload: payload,
        },
        (err: any, response: any) => {
          const responsepayload = JSON.parse(response.payload);
          t.error(err);
          t.equal(response.statusCode, 401);
          t.equal(
            response.headers["content-type"],
            "application/json; charset=utf-8"
          );
          t.same(responsepayload, { error: "Invalid username or password" });
        }
      );
    }
  );
  tap.test("success 1 POST /auth/login route", async (t: Test) => {
    t.plan(5);
    const tracker = getTracker();
    tracker.install();
    tracker.on("query", async function sendResult(query: QueryDetails) {
      const password = await hashPassword("123456");
      query.response([
        {
          id: 1,
          username: "test",
          email: "test@test.com",
          role_id: 2,
          password: password,
        },
      ]);
    });

    const fastify = buildFastify();
    t.teardown(() => {
      tracker.uninstall();
      fastify.close();
    });
    await fastify.ready();
    const payload = {
      username: "test",
      password: "123456",
      remember: true,
    };
    fastify.inject(
      {
        method: "POST",
        url: "/auth/login",
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
        t.equal(!responsepayload.token, false);
        t.same(responsepayload.user, {
          username: "test",
          email: "test@test.com",
          id: 1,
          role_id: 2,
        });
      }
    );
  });
  tap.test("success 2 POST /auth/login route", async (t: Test) => {
    t.plan(5);
    const tracker = getTracker();
    tracker.install();
    tracker.on("query", async function sendResult(query: QueryDetails) {
      const password = await hashPassword("123456");
      query.response([
        {
          id: 1,
          username: "test",
          email: "test@test.com",
          role_id: 2,
          password: password,
        },
      ]);
    });

    const fastify = buildFastify();
    t.teardown(() => {
      tracker.uninstall();
      fastify.close();
    });
    await fastify.ready();
    const payload = {
      username: "test",
      password: "123456",
      remember: false,
    };
    fastify.inject(
      {
        method: "POST",
        url: "/auth/login",
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
        t.equal(!responsepayload.token, false);
        t.same(responsepayload.user, {
          username: "test",
          email: "test@test.com",
          id: 1,
          role_id: 2,
        });
      }
    );
  });
});
