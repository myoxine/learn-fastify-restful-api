// src/models/User.ts

import { Model, ModelObject, JSONSchema } from "objection";
import { hashPassword } from "./../utils/encrypt";
// Definisikan kelas User yang mewarisi dari Model
class User extends Model {
  // Nama tabel yang digunakan oleh model ini
  static tableName = "users";

  id!: number;
  username!: string;
  email!: string;
  role_id?: number;
  password!: string;
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
  static get jsonSchema(): JSONSchema {
    return {
      type: "object",
      required: ["username", "email", "password"],
      properties: {
        id: { type: "integer" },
        username: { type: "string", minLength: 1, maxLength: 255 },
        password: { type: "string" },
        email: { type: "string", format: "email", maxLength: 255 },
        role_id: { type: ["integer", "null"] },
      },
    };
  }
  async $beforeInsert() {
    this.password = await hashPassword(this.password);
  }

  async $beforeUpdate() {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }
}
const PublicUserSchema = JSON.parse(JSON.stringify(User.jsonSchema));
delete PublicUserSchema.properties.password;
PublicUserSchema.required = PublicUserSchema.required.filter(
  (value: string) => value !== "password"
);
type UserType = ModelObject<User>;
type PublicUserType = Omit<UserType, "password">;
export type { UserType, PublicUserType };
export { PublicUserSchema };
export default User;
