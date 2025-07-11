import { z } from "zod";

/**
 * Zod schema for a User object.
 * This schema defines the structure and validation rules for user data
 * that will be stored in the database and potentially used for API request validation.
 */
export const userSchema = z.object({
  // _id: MongoDB's unique identifier. It's typically an ObjectId, but when
  // retrieved or sent over API, it might be a string. `z.any().optional()`
  // is a flexible choice here, as it's usually managed by the database.
  _id: z.any().optional(),

  // name: User's full name. Must be at least 3 characters long.
  // FIX: Added .nullable() because name might be null (e.g., for OAuth users without a name, or if cleared).
  name: z.string().min(3, "Name must be at least 3 characters").nullable(),

  // email: User's email address. Must be a valid email format.
  // This is a primary identifier and crucial for authentication.
  email: z.string().email("Invalid email address"),

  // password: User's password. Must be at least 6 characters long.
  // IMPORTANT: This schema validates the *raw* password input. In the database,
  // passwords should always be stored as securely hashed values (e.g., using bcrypt).
  password: z.string().min(6, "Password must be at least 6 characters"),

  // emailVerified: Boolean flag indicating if the user's email has been verified.
  // Defaults to `false` for new signups.
  emailVerified: z.boolean().default(false),

  // role: User's role within the application. Enforces a strict set of allowed roles.
  // Defaults to "user".
  role: z.enum(["user", "admin"]).default("user"),

  // avatar: URL to the user's profile picture. Optional.
  // FIX: Added .nullable() because avatar URL might be null if not set.
  avatar: z.string().url("Invalid URL format for avatar.").nullable().optional(),

  // isActive: Boolean flag indicating if the user account is active.
  // Defaults to `true`. Can be used for soft-deleting or deactivating accounts.
  isActive: z.boolean().default(true),

  // lastLogin: Date of the user's last login. Optional, as it might not be set initially.
  // Stored as a Date object in MongoDB.
  // FIX: Added .nullable() because lastLogin might be null (e.g., for new users).
  lastLogin: z.date().nullable().optional(),

  // provider: Authentication provider used (e.g., "credentials", "google", "github").
  // Defaults to "credentials". Optional, as it might be inferred or set by OAuth flows.
  provider: z.enum(["credentials", "google", "github"]).default("credentials").optional(),

  // phone: User's phone number. Optional.
  // Further validation (e.g., regex for specific formats) could be added if needed.
  // FIX: Added .nullable() because phone might be null if not provided.
  phone: z.string().nullable().optional(),

  // otp: One-Time Password for verification. Optional, and should be cleared after use.
  // Enforces a 6-character length.
  // FIX: Added .nullable() because OTP is set to null after use.
  otp: z.string().length(6, "OTP must be 6 digits.").nullable().optional(),

  // otpExpiry: Expiry date/time for the OTP. Optional, and should be cleared after use.
  // FIX: Added .nullable() because OTP expiry is set to null after use.
  otpExpiry: z.date().nullable().optional(),

  // createdAt: Timestamp for when the user account was created. Optional, but usually
  // set automatically upon insertion.
  // FIX: Added .nullable() because it might be null initially or if not explicitly set by DB driver.
  createdAt: z.date().nullable().optional(),

  // updatedAt: Timestamp for when the user account was last updated. Optional, but usually
  // updated on every modification.
  // FIX: Added .nullable() because it might be null initially or if not explicitly set by DB driver.
  updatedAt: z.date().nullable().optional(),
});

/**
 * TypeScript type inferred directly from the Zod schema.
 * This provides strong type checking for User objects throughout your application.
 */
export type User = z.infer<typeof userSchema>;
