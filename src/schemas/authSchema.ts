export const loginSchema = {
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string", description: "Username for login" },
      password: { type: "string", description: "Password for login" },
    },
  },
};
