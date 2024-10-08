import User, {PublicUserSchema} from "../models/User";
import { JSONSchema } from "objection";
const bodySchema: JSONSchema = JSON.parse(JSON.stringify(User.jsonSchema));
delete bodySchema?.properties?.id;
bodySchema?.required?.push("confirm_password");
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
    200: PublicUserSchema,
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
