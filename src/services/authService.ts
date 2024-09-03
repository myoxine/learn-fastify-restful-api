import { credentials } from "../models/authModel";

// Function to authenticate user
export async function authenticateUser(username: string, password: string) {
  await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate delay
  return (
    credentials.find(
      (cred) => cred.username === username && cred.password === password
    ) || null
  );
}
