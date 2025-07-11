import nodemailer from "nodemailer";
import { Transporter } from "nodemailer"; // Import Transporter type for explicit typing

// Environment variable checks
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER) {
  throw new Error(
    "EMAIL_USER environment variable is not defined. Please set it in your .env.local file."
  );
}

if (!EMAIL_PASS) {
  throw new Error(
    "EMAIL_PASS environment variable is not defined. Please set it in your .env.local file."
  );
}

// Declare a variable to hold the transporter instance.
// We'll create it lazily or once and reuse it.
let cachedTransporter: Transporter | null = null;

/**
 * Returns a Nodemailer transporter instance.
 * The transporter is created once and reused for efficiency.
 * It uses environment variables for authentication.
 * @returns {Transporter} A Nodemailer transporter instance.
 * @throws {Error} If EMAIL_USER or EMAIL_PASS environment variables are not set.
 */
export function getTransporter(): Transporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // Create the transporter if it hasn't been created yet
  cachedTransporter = nodemailer.createTransport({
    service: "gmail", // Or your preferred SMTP service (e.g., 'smtp.mailtrap.io', 'Outlook365', etc.)
    auth: {
      user: EMAIL_USER as string, // Type assertion as we've checked for undefined above
      pass: EMAIL_PASS as string, // Type assertion as we've checked for undefined above
    },
    // Optional: Add a connection timeout for robustness in production
    // timeout: 10000, // 10 seconds
  });

  // Optional: Verify connection in development or during application startup
  // In a real production app, you might want to call transporter.verify()
  // once on server startup to ensure credentials are correct.
  // For example, in your global Next.js API setup or a dedicated health check endpoint.
  if (process.env.NODE_ENV === "development") {
    // FIX: Added ESLint disable comment to specifically ignore the unused '_success' variable.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cachedTransporter.verify((error, _success) => {
      if (error) {
        console.error("Nodemailer transporter verification failed:", error);
      } else {
        console.log("Nodemailer transporter is ready to send emails.");
      }
    });
  }

  return cachedTransporter;
}

// Removed direct export of mailOptions.
// The 'from' address should be constructed dynamically in your email sending functions
// (e.g., sendOTPEmail, sendVerificationSuccessEmail) to ensure it's always current
// and allows for more flexible 'from' names.
