// src/models/User.ts

import { Model, JSONSchema as JSONSchemaObj,ModelObject } from "objection";
import { FromSchema } from "json-schema-to-ts";
import type { JSONSchema } from "json-schema-to-ts";
import { type } from "os";
// Definisikan kelas User yang mewarisi dari Model
class User extends Model  {
  // Nama tabel yang digunakan oleh model ini
  static tableName = "users";

  id !: number;
  username !: string;
  email !: string;
  role_id?: number;

  // Definisikan tipe properti model

  // Jika kamu menggunakan type-checking, tambahkan tipe untuk kolom
  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/Role`, // Pastikan path ke model Role benar
        join: {
          from: "users.role_id",
          to: "roles.id",
        },
      },
    };
  }
  static get jsonSchema() {
    return {
      type: "object",
      required: ["username", "email"],
      properties: {
        id: { type: 'integer' },
        username: { type: "string", minLength: 1, maxLength: 255 },
        email: { type: "string", format: "email", maxLength: 255 },
        role_id: { type: ["integer", "null"] },
      },
    };
  }
}

type UserType = ModelObject<User>;
export type { UserType };
export default User;
