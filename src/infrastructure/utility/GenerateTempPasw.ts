import crypto from "crypto";

export const generateTempPassword = (length = 8) => {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
};
