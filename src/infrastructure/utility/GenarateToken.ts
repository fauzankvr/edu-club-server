import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid"; // For unique refresh token IDs

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refreshsecret#123";

// Generate Access Token
export const generateAccessToken = (
  payload: { email: string; _id?: string },
  expiresIn: number = 15 * 60 // 15 minutes
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, SECRET_KEY, options);
};

// Generate Refresh Token
export const generateRefreshToken = (
  payload: { email: string; _id?: string },
  expiresIn: number = 7 * 24 * 60 * 60 // 7 days
): string => {
  const refreshPayload = { ...payload, id: uuidv4() }; 
  const options: SignOptions = { expiresIn };
  const token = jwt.sign(refreshPayload, REFRESH_SECRET, options);

  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  return token;
};

// Verify Access Token
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, SECRET_KEY) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {

    console.log("refresh token...........")
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  } catch (error) {
    throw error instanceof jwt.TokenExpiredError
      ? new Error("Refresh token expired")
      : error;
  }
};
