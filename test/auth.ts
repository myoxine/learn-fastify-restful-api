import tap, { Test } from "tap";
import * as authService from "./../src/services/authService";
import bcrypt from "bcrypt";
import { ImportMock } from "ts-mock-imports";
import { storeToken } from "./../src/services/authService";
import { to_number_of_seconds } from "./../src/utils/expiry";
import { PublicUserType } from "./../src/models/User";
import { faker } from "@faker-js/faker";
import { setupFastify, teardownFastify, injectRequest, mockBcryptError, mockAuthServiceError,mockRedisError, createPayloadUser, createTracker, getDbUser, checkResponseHeader, getResUser } from "./../src/utils/testHelper";
tap.test("POST /auth/login route", async (t: Test) => {
  tap.test("success login with remembering password", async (t: Test) => {
    const reqUser = createPayloadUser(["username", "password", "remember"], { username:faker.internet.userName(),password: "123456", remember: true });
    const dbUser = await getDbUser(reqUser);
    const tracker = createTracker([dbUser]);
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, undefined, tracker));
    const resUser = await getResUser(dbUser);
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", reqUser);
    checkResponseHeader(t, response, 200);
    t.equal(!parsedPayload.token, false);
    t.same(parsedPayload.user, resUser);
  });
  tap.test("success login without remembering password", async (t: Test) => {
    const reqUser = createPayloadUser(["username", "password", "remember"], { username:faker.internet.userName(),password: "123456", remember: false });
    const dbUser = await getDbUser(reqUser);
    const tracker = createTracker([dbUser]);
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, undefined, tracker));
    const resUser = await getResUser(dbUser);
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", reqUser);
    checkResponseHeader(t, response, 200);
    t.equal(!parsedPayload.token, false);
    t.same(parsedPayload.user, resUser);
  });
  tap.test("catch error bycrypt ", async (t: Test) => {
    const mockBcryptManager = mockBcryptError("compare", "throw error bcrypt");
    const reqUser = createPayloadUser(["username", "password", "remember"], {  });
    const dbUser = await getDbUser(reqUser);
    const tracker = createTracker([dbUser]);
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, [mockBcryptManager], tracker));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", reqUser);
    checkResponseHeader(t, response, 500);
    t.same(parsedPayload, { error: "Internal Server Error" });
  });
  tap.test("catch error jwt generateToken ", async (t: Test) => {
    const mockAuthServiceManager = mockAuthServiceError("generateToken", "throw error generateToken");
    const reqUser = createPayloadUser(["username", "password", "remember"], {  });
    const dbUser = await getDbUser(reqUser);
    const tracker = createTracker([dbUser]);
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, [mockAuthServiceManager], tracker));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", reqUser);
    checkResponseHeader(t, response, 500);
    t.same(parsedPayload, { error: "Internal Server Error" });
  });
  tap.test("failed user not found", async (t: Test) => {
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const reqUser = createPayloadUser(["username", "password", "remember"], { password: "123456", remember: true });
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", reqUser);
    checkResponseHeader(t, response, 401);
    t.same(parsedPayload, { error: "Invalid username or password" });
  });
  tap.test("failed password not match", async (t: Test) => {
    const fastify = await setupFastify();
    const reqUser = createPayloadUser(["username", "password", "remember"], { password: "123456", remember: true });
    const dbUser = await getDbUser({ ...reqUser, password: "1234567" });
    const tracker = createTracker([dbUser]);
    t.teardown(() => teardownFastify(fastify, undefined, tracker));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", reqUser);
    checkResponseHeader(t, response, 401);
    t.same(parsedPayload, { error: "Invalid username or password" });
  });
  tap.test("check error validation with english language", async (t: Test) => {
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", {}, { "accept-language": "en" });
    checkResponseHeader(t, response, 400);
    t.equal(parsedPayload.message, "must have required property username, must have required property password, must have required property remember");
    t.same(parsedPayload.errors, [
      { key: "username", value: "must have required property username" },
      { key: "password", value: "must have required property password" },
      { key: "remember", value: "must have required property remember" },
    ]);
  });
  tap.test("check error validation with indonesian language", async (t: Test) => {
    const fastify = await setupFastify();
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", "/auth/login", {}, { "accept-language": "id" });
    checkResponseHeader(t, response, 400);
    t.equal(parsedPayload.message, "harus memiliki properti username, harus memiliki properti password, harus memiliki properti remember");
    t.same(parsedPayload.errors, [
      { key: "username", value: "harus memiliki properti username" },
      { key: "password", value: "harus memiliki properti password" },
      { key: "remember", value: "harus memiliki properti remember" },
    ]);
  });
});
tap.test("POST /auth/logout route", async (t: Test) => {
  tap.test("success user logout", async (t: Test) => {
    const fastify = await setupFastify();
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({})) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: true }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", `/auth/logout`, undefined, { authorization: `Bearer ${accessToken}` }, { refreshToken: refreshToken });
    checkResponseHeader(t, response, 200);
    t.same(parsedPayload, { message: "Logout successful" });
  });
  tap.test("catch redis error", async (t: Test) => {
    const fastify = await setupFastify();
    const mockRedisManager = mockRedisError(fastify.redis,"del", "throw error redis delete");
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({})) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: true }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    t.teardown(() => teardownFastify(fastify, [mockRedisManager], undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", `/auth/logout`, undefined, { authorization: `Bearer ${accessToken}` }, { refreshToken: refreshToken });
    checkResponseHeader(t, response, 500);
    t.same(parsedPayload, { error: "Failed to logout" });
  });
});

tap.test("GET /auth/me route", async (t: Test) => {
  tap.test("success get user detail", async (t: Test) => {
    const fastify = await setupFastify();
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({})) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: true }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "GET", `/auth/me`, undefined, { authorization: `Bearer ${accessToken}` }, { refreshToken: refreshToken });
    const resUser = await getResUser(dbUser);
    checkResponseHeader(t, response, 200);
    t.same(parsedPayload, resUser);
  });
  tap.test("Failed when access token and request token didnt match", async (t: Test) => {
    const fastify = await setupFastify();
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({})) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: true }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    const dbUser2 = (await getDbUser({})) as PublicUserType;
    const accessToken2 = fastify.jwt.sign({ user: dbUser2 }, { expiresIn: "15m" });
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "GET", `/auth/me`, undefined, { authorization: `Bearer ${accessToken2}` }, { refreshToken: refreshToken });
    checkResponseHeader(t, response, 500);
    t.same(parsedPayload, {
      statusCode: 500,
      error: "Internal Server Error",
      message: "Access token and request token didnt match",
    });
  });
  tap.test("Failed when token has been expired", async (t: Test) => {
    const fastify = await setupFastify();
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({})) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: true }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    const dbUser2 = (await getDbUser({})) as PublicUserType;
    const accessToken2 = fastify.jwt.sign({ user: dbUser2 }, { expiresIn: "15m" });
    const refreshToken2 = fastify.jwt.sign({ user: dbUser2, remember: true }, { expiresIn: "1d" });
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "GET", `/auth/me`, undefined, { authorization: `Bearer ${accessToken2}` }, { refreshToken: refreshToken2 });
    checkResponseHeader(t, response, 500);
    t.same(parsedPayload, {
      statusCode: 500,
      error: "Internal Server Error",
      message: "Your token has been expired",
    });
  });
});
tap.test("POST /auth/refresh route", async (t: Test) => {
  tap.test("success refresh token with remember login", async (t: Test) => {
    const fastify = await setupFastify();
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({})) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: true }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", `/auth/refresh-token`, undefined, { authorization: `Bearer ${refreshToken}` }, { refreshToken: refreshToken });
    checkResponseHeader(t, response, 200);
    t.equal(!parsedPayload.token, false);
  });
  tap.test("success refresh token without remember login", async (t: Test) => {
    const fastify = await setupFastify();
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({
      id:faker.number.int(10000),
      username:faker.internet.userName(),
      email:faker.internet.email(),
      password:faker.internet.password(),
      created_at:faker.date.anytime(),
      updated_at:faker.date.anytime()
    })) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: false }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    t.teardown(() => teardownFastify(fastify, undefined, undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", `/auth/refresh-token`, undefined, { authorization: `Bearer ${refreshToken}` }, { refreshToken: refreshToken });
    checkResponseHeader(t, response, 200);
    t.equal(!parsedPayload.token, false);
  });
  tap.test("catch error jwt generateToken ", async (t: Test) => {
    const mockAuthServiceManager = mockAuthServiceError("generateToken","throw error generateToken") 
    const fastify = await setupFastify();
    const duration = to_number_of_seconds("1d");
    const dbUser = (await getDbUser({})) as PublicUserType;
    const accessToken = fastify.jwt.sign({ user: dbUser }, { expiresIn: "15m" });
    const refreshToken = fastify.jwt.sign({ user: dbUser, remember: true }, { expiresIn: "1d" });
    storeToken(fastify, refreshToken, accessToken, dbUser, duration);
    t.teardown(() => teardownFastify(fastify, [mockAuthServiceManager], undefined));
    const { response, parsedPayload } = await injectRequest(fastify, "POST", `/auth/refresh-token`, undefined, { authorization: `Bearer ${refreshToken}` }, { refreshToken: refreshToken });
    checkResponseHeader(t, response, 401);
    t.same(parsedPayload, { error: "Invalid refresh token" });
  });
});
