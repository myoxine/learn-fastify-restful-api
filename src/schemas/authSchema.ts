import {PublicUserSchema} from "../models/User";

export const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string", description: "Username for login" },
      password: { type: "string", description: "Password for login" },
    },
  },
  response: {
    200:  {
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
  response: {
    200:  PublicUserSchema,
  },
};
