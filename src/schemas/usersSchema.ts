import User, {PublicUserSchema} from "../models/User";
import { JSONSchema } from "objection";
const bodySchema: JSONSchema = User.jsonSchema;
if (bodySchema.properties) delete bodySchema.properties.id;
if (bodySchema.required) bodySchema.required.push("confirm_password");
bodySchema.properties = {
  ...bodySchema.properties,
  confirm_password: {
    type: "string",
    const: {
      $data: "1/password",
    },
  },
};


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
        user: PublicUserSchema,
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
        user: PublicUserSchema,
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
          oneOf: [{ type: "null" }, PublicUserSchema],
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
