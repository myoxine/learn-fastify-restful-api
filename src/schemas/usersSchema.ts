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
    200: User.jsonSchema,
  },
};

export const addUserSchema = {
  body: bodySchema,
  response: {
    201: {
      message:"string",
      user:User.jsonSchema
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
      message:"string",
      user:User.jsonSchema
    }
  },
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
