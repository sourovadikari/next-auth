//utils/token.ts
import crypto from "crypto";

/**
 * Generate a secure random hex token string
 * @param bytes Number of random bytes to generate (default 32)
 * @returns hex string token
 */
export function generateToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/**
 * Generate a verification token expiry date
 * @param minutes Number of minutes from now for expiry (default 5)
 * @returns Date object representing expiry time
 */
export function generateTokenExpiry(minutes: number = 5): Date {
  return new Date(Date.now() + 1000 * 60 * minutes);
}

/**
 * Check if a token is expired
 * @param expiryDate Date object representing token expiry
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(expiryDate: Date): boolean {
  return expiryDate.getTime() < Date.now();
}
