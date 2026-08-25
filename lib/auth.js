import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "sppg-mbg-secret-key-change-in-production";
const EXPIRES_IN = "24h";

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
