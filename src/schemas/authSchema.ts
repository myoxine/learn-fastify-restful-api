import { PublicUserSchema } from "../models/User";

export const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password", "remember"],
    properties: {
      username: { type: "string", description: "Username for login" },
      password: { type: "string", description: "Password for login" },
      remember: { type: "boolean" },
    },
  },
  response: {
    200: {
      type: "object",
      required: ["user", "token"],
      properties: {
        token: { type: "string", description: "Token" },
        user: PublicUserSchema,
      },
    },
  },
};

export const profileSchema = {
  headers: {
    type: "object",
    properties: {
      authorization: {
        type: "string",
        pattern:
          "^Bearer [A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*$",
      },
    },
    required: ["authorization"],
  },
  response: {
    200: PublicUserSchema,
  },
};

export const refreshSchema = {
  headers: {
    type: "object",
    properties: {
      authorization: {
        type: "string",
        pattern:
          "^Bearer [A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_.+/=]*$",
      },
    },
    required: ["authorization"],
  },
  response: {
    200: {
      type: "object",
      required: ["token"],
      properties: {
        token: { type: "string", description: "Token" },
      },
    },
  },
};
