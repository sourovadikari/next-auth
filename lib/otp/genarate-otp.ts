import crypto from "crypto";

/**
 * Generates a secure, cryptographically strong 6-digit numeric OTP (One-Time Password) as a string.
 * This function uses Node.js's built-in `crypto` module for generating random bytes,
 * which is suitable for security-sensitive applications.
 *
 * The process involves:
 * 1. Generating a sufficient number of random bytes.
 * 2. Converting these bytes to a hexadecimal string.
 * 3. Parsing the hexadecimal string into an integer.
 * 4. Taking the modulo 1,000,000 to ensure the number is within the 0-999,999 range.
 * 5. Padding the number with leading zeros to ensure it is always 6 digits long.
 *
 * @returns {string} A 6-digit OTP string (e.g., "012345", "987654").
 * @throws {Error} If there's an issue generating random bytes or processing the OTP.
 */
export function generateOTP(): string {
  try {
    // Generate 4 random bytes. This provides 2^32 possible values.
    // 2^32 is approximately 4.29 billion.
    // When taking modulo 1,000,000, this ensures a good distribution
    // and makes it extremely difficult to guess the OTP.
    const bytes = crypto.randomBytes(4);

    // Convert the bytes to a hexadecimal string, then parse it as an integer.
    // Take modulo 1,000,000 to get a number between 0 and 999,999.
    const otp = parseInt(bytes.toString("hex"), 16) % 1000000;

    // Pad the OTP with leading zeros to ensure it's always 6 digits long.
    // For example, if otp is 123, it becomes "000123".
    return otp.toString().padStart(6, "0");
  } catch (error: unknown) { // Use 'unknown' for caught errors for better type safety
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("[OTP Generation Error]: Failed to generate OTP.", errorMessage, error);
    // Re-throw the error to ensure calling functions are aware of the failure
    throw new Error(`Failed to generate OTP: ${errorMessage}`);
  }
}
