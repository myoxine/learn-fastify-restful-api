import { FastifyInstance } from "fastify";
import User from "./../models/User";
import { verifyPassword } from "./../utils/encrypt";
// Function to authenticate user
export async function authenticateUser(username: string, password: string) {
  const user = await User.query().findOne({ username });
  if (!user) {
    return null;
  }
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }
  return user;
}
export const generateToken = (fastify: FastifyInstance, user: User) => {
  return fastify.jwt.sign({ user });
};
