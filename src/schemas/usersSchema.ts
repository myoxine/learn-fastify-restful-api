import User from "../models/User";
const bodySchema = JSON.parse(JSON.stringify(User.jsonSchema));
delete bodySchema.properties.id;

export const getUserSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "User ID" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        user: User.jsonSchema,
      },
    }
  },
};

export const addUserSchema = {
  body: bodySchema,
  response: {
    201: {
      type: "object",
      properties: {
        message: { type: "string" },
        user: User.jsonSchema,
      },
    }
  },
};

export const updateUserSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "User ID" },
    },
  },
  body: bodySchema,
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        user: {
          oneOf: [{ type: "null" }, User.jsonSchema],
        },
      },
    },
  }
};

export const deleteUserSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "User ID" },
    },
  },
};
