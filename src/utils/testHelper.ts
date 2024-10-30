import { buildFastify } from "./../server";
import { faker } from "@faker-js/faker";
import { ImportMock, OtherManager } from "ts-mock-imports";
import type { FastifyInstance, InjectOptions } from "fastify";
import type { Tracker } from "mock-knex";
import type { Response } from "light-my-request";
import bcrypt from "bcrypt";
import tap, { Test } from "tap";
import { getTracker, QueryDetails } from "mock-knex";
export async function setupFastify() {
  const fastify = buildFastify();
  await fastify.ready();
  return fastify;
}

export async function teardownFastify(fastify: FastifyInstance, mockManager?: OtherManager<any>, tracker?: Tracker) {
  if (mockManager) {
    mockManager.restore();
  }
  if (tracker) {
    tracker.uninstall();
  }
  await fastify.close();
}

export async function injectRequest(fastify: FastifyInstance, method: InjectOptions["method"], url: InjectOptions["url"], payload?: InjectOptions["payload"], headers?: InjectOptions["headers"], cookies?: InjectOptions["cookies"]) {
  const response = await fastify.inject({ method, url, payload, headers, cookies });
  const parsedPayload = JSON.parse(response.payload);
  return { response, parsedPayload };
}

export function mockBcryptError(importName: keyof typeof bcrypt, errorString: string) {
  return ImportMock.mockOther(bcrypt, importName, () => {
    throw new Error(errorString);
  });
}

export function createTracker(responses: any[]) {
  const tracker = getTracker();
  tracker.install();
  tracker.on("query", function sendResult(query: QueryDetails) {
    query.response(responses);
  });
  return tracker;
}
type userFields = "username" | "email" | "role_id" | "password" | "confirm_password" | "id" | "remember" | "created_at" | "updated_at";
export function createPayloadUser(fields: userFields[], defaults: { [key: string]: any }) {
  const obj: { [key: string]: any } = {
    id: fields.includes("id") ? (defaults.hasOwnProperty("id") ? defaults["id"] : faker.number.int(10000)) : undefined,
    username: defaults.hasOwnProperty("username") ? defaults["username"] : faker.internet.userName(),
    email: fields.includes("email") ? (defaults.hasOwnProperty("email") ? defaults["email"] : faker.internet.email()) : undefined,
    role_id: fields.includes("role_id") ? (defaults.hasOwnProperty("role_id") ? defaults["role_id"] : faker.number.int(10)) : undefined,
    password: fields.includes("password") ? (defaults.hasOwnProperty("password") ? defaults["password"] : faker.internet.password()) : undefined,
    confirm_password: fields.includes("confirm_password") ? (defaults.hasOwnProperty("confirm_password") ? defaults["confirm_password"] : faker.internet.password()) : undefined,
    remember: fields.includes("remember") ? (defaults.hasOwnProperty("remember") ? defaults["remember"] : faker.datatype.boolean()) : undefined,
    created_at: fields.includes("created_at") ? (defaults.hasOwnProperty("created_at") ? defaults["created_at"] : faker.date.anytime()) : undefined,
    updated_at: fields.includes("updated_at") ? (defaults.hasOwnProperty("updated_at") ? defaults["updated_at"] : faker.date.anytime()) : undefined,
  };
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
  return obj;
}
export async function getDbUser(defaults: { [key: string]: any }) {
  const obj: { [key: string]: any } = {
    ...defaults,
    password: defaults.hasOwnProperty("password") ? await bcrypt.hash(defaults.password, 1) : await bcrypt.hash(faker.internet.password(), 1),
  };
  return createPayloadUser(["id", "username", "email", "role_id", "password", "created_at", "updated_at"], obj);
}

export async function getResUser(defaults: { [key: string]: any }) {
  return createPayloadUser(["id", "username", "email", "role_id"], defaults);
}

export function checkResponseHeader(t: Test, response: Response, statusCode: number, contentType = "application/json; charset=utf-8") {
  t.equal(response.statusCode, statusCode);
  t.equal(response.headers["content-type"], contentType);
}
