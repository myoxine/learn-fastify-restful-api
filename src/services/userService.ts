import { users } from "../models/userModel";

// Function to get user by ID
export async function getUserById(id: string) {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
  return users.find((user) => user.id === id) || null;
}

// Function to add a new user
export async function addUser(name: string, age: number) {
  const newUser = { id: String(users.length + 1), name, age };
  users.push(newUser);
  return newUser;
}

// Function to update an existing user
export async function updateUser(id: string, name?: string, age?: number) {
  const user = await getUserById(id);
  if (user) {
    user.name = name || user.name;
    user.age = age || user.age;
    return user;
  }
  return null;
}

// Function to delete a user
export async function deleteUser(id: string) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    users.splice(index, 1);
  }
}
