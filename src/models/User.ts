// src/models/User.ts

import { Model } from 'objection';

// Definisikan kelas User yang mewarisi dari Model
class User extends Model {
  // Nama tabel yang digunakan oleh model ini
  static tableName = 'users';

  // Definisikan tipe properti model
  id!: number;
  username!: string;
  email!: string;
  role_id?: number;

  // Jika kamu menggunakan type-checking, tambahkan tipe untuk kolom
  static get relationMappings() {
    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/Role`, // Pastikan path ke model Role benar
        join: {
          from: 'users.role_id',
          to: 'roles.id'
        }
      }
    };
  }
}

export default User;
