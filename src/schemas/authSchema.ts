import User from "../models/User";
const responseUserSchema = JSON.parse(JSON.stringify(User.jsonSchema));
delete responseUserSchema.properties.password;

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
        user: responseUserSchema,
      },
    },
  },
};
