export const getUserSchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", description: "User ID" },
    },
  },
};

export const addUserSchema = {
  body: {
    type: "object",
    required: ["name", "age"],
    properties: {
      name: { type: "string" },
      age: { type: "integer", range: [2, 4], exclusiveRange: true },
      phone: { type: "string", format: "phoneNumber" }, // Pakai format custom
    },
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
  body: {
    type: "object",
    properties: {
      name: { type: "string", description: "Name of the user" },
      age: { type: "integer" },
    },
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
