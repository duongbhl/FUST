import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = (password: string) => bcrypt.hash(password, SALT_ROUNDS);
export const comparePassword = (password: string, hash: string) => bcrypt.compare(password, hash);
export const hashToken = (token: string) => bcrypt.hash(token, SALT_ROUNDS);
export const compareToken = (token: string, hash: string) => bcrypt.compare(token, hash);
