import bcrypt from "bcrypt";
import config from "./config";
export const hashPassword = async (password: string) => {
  try {
    const hashedPassword = await bcrypt.hash(password, config.SALT_ROUNDS_PASSWORD);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const verifyPassword = async (password: string, hashedPassword: string) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error('Error verifying password');
  }
};
