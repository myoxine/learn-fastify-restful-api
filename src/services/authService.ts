import { FastifyRequest, FastifyInstance } from "fastify";
import User, { PublicUserType } from "./../models/User";
import { verifyPassword } from "./../utils/encrypt";
import config from "./../utils/config";
import { to_number_of_seconds } from "./../utils/expiry";
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
export const generateToken = async (
  request: FastifyRequest,
  user: PublicUserType,
  remember: boolean
) => {
  const accessToken = await request.server.jwt.sign(
    { user, remember },
    {
      expiresIn: remember
        ? config.ACCESS_TOKEN_LONG_DURATION
        : config.ACCESS_TOKEN_SHORT_DURATION,
    }
  );
  const refreshToken = await request.server.jwt.sign(
    { user },
    {
      expiresIn: remember
        ? config.REFRESH_TOKEN_LONG_DURATION
        : config.REFRESH_TOKEN_SHORT_DURATION,
    }
  );
  return { accessToken, refreshToken };
};
export const generateAccessToken = async (
  request: FastifyRequest,
  user: PublicUserType,
  remember: boolean
) => {
  const accessToken = await request.server.jwt.sign(
    { user, remember },
    {
      expiresIn: remember
        ? config.ACCESS_TOKEN_LONG_DURATION
        : config.ACCESS_TOKEN_SHORT_DURATION,
    }
  );
  return accessToken;
};
export const storeToken = async (
  fastify: FastifyInstance,
  refreshToken: string,
  accessToken: string,
  user: PublicUserType,
  duration:number
) => {
  await fastify.redis.set(
    `refreshToken:${user.id}-${refreshToken}`,
    accessToken,
    "EX",
    duration
  );
};

