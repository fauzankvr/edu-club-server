import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Environment-based secrets 
const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsecret#123";


// Define allowed roles
export type UserRole = "student" | "instructor" | "admin";

// Extend the payload to include role
export interface TokenPayload {
  email: string;
  id: string;
  role: UserRole;
}

// Generate Access Token
export const generateAccessToken = (
  payload: TokenPayload,
  expiresIn: number = 24 * 60 * 60 // 15 minutes
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, SECRET_KEY, options);
};

// Generate Refresh Token
export const generateRefreshToken = (
  payload: TokenPayload,
  expiresIn: number = 7 * 24 * 60 * 60 // 7 days
): string => {
  const refreshPayload = {
    ...payload,
    refreshId: uuidv4(), // Keep original `id`, add unique refresh ID
  };
  const options: SignOptions = { expiresIn };
  return jwt.sign(refreshPayload, REFRESH_SECRET, options);
};

// Verify Access Token
export const verifyAccessToken = (token: string): JwtPayload & TokenPayload => {
  try {
    return jwt.verify(token, SECRET_KEY) as JwtPayload & TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (
  token: string
): JwtPayload & TokenPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload & TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token");
  }
};
