import { FastifyRequest } from "fastify";
import User from "./../models/User";
import { verifyPassword } from "./../utils/encrypt";
import config from "./../utils/config";
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
export const generateToken = async (request: FastifyRequest, user: User) => {
  const accessToken = await request.server.jwt.sign(
    { user },
    { expiresIn: config.ACCESS_TOKEN_LONG_DURATION }
  );
  const refreshToken = await request.server.jwt.sign(
    { user },
    { expiresIn: config.REFRESH_TOKEN_LONG_DURATION }
  );
  return { accessToken, refreshToken };
};
