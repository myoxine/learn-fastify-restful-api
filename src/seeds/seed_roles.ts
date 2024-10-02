import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  return knex("roles")
    .del()
    .then(function () {
      return knex("roles").insert([
        { role_name: "User" },
        { role_name: "Admin" },
        { role_name: "Staff" },
      ]);
    });
}
