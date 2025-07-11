import { getTransporter } from "@/lib/email/nodemailer"; // Import the centralized getTransporter function
import { Transporter } from "nodemailer"; // Import Transporter type for explicit typing
import Mail from "nodemailer/lib/mailer"; // Import Mail type for mailOptions

// Get the transporter instance. It will throw an error if EMAIL_USER/PASS are not set.
const transporter: Transporter = getTransporter();

// Define a consistent "from" address for all emails
const APP_EMAIL_USER = process.env.EMAIL_USER as string; // Assert as string, as getTransporter validates it
const APP_NAME = "YourApp"; // Define your application's name for consistent branding

/**
 * Sends an OTP (One-Time Password) email for signup or password reset.
 * @param to The recipient's email address.
 * @param otp The 6-digit OTP to send.
 * @param type The type of OTP: "signup" or "password-reset".
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
export async function sendOTPEmail(to: string, otp: string, type: "signup" | "password-reset" = "signup"): Promise<void> {
  let subject = "";
  let htmlContent = "";
  let textContent = ""; // Plain text version

  // Base styles for the HTML email
  const baseHtmlStyles = `
    font-family: -apple-system, BlinkMacMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    line-height: 1.6;
    color: #333;
  `;

  if (type === "signup") {
    subject = `${APP_NAME} - Verify Your Email Address`;
    htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
              body { ${baseHtmlStyles} margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              h2 { color: #1a73e8; margin-bottom: 15px; text-align: center; }
              p { margin-bottom: 10px; }
              .otp-code { font-size: 2.5rem; font-weight: bold; color: #1a73e8; letter-spacing: 8px; margin: 20px 0; text-align: center; padding: 10px; background-color: #e8f0fe; border-radius: 5px; }
              .expiry-note { color: #555; font-size: 0.95rem; text-align: center; margin-top: 15px;}
              hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
              .footer { font-size: 0.85rem; color: #999; text-align: center; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Email Verification</h2>
              <p>Thank you for registering with ${APP_NAME}! Please use the verification code below to verify your email address:</p>
              <div class="otp-code">${otp}</div>
              <p class="expiry-note">This code will expire in <strong>10 minutes</strong>.</p>
              <hr>
              <p class="footer">If you did not create an account, please ignore this email.</p>
              <p class="footer">${APP_NAME} Support Team</p>
          </div>
      </body>
      </html>
    `;
    textContent = `
      Thank you for registering with ${APP_NAME}!

      Please use the verification code below to verify your email address:

      ${otp}

      This code will expire in 10 minutes.

      If you did not create an account, please ignore this email.

      ${APP_NAME} Support Team
    `;
  } else if (type === "password-reset") {
    subject = `${APP_NAME} - Your Password Reset Code`;
    htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
              body { ${baseHtmlStyles} margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              h2 { color: #d93025; margin-bottom: 15px; text-align: center; }
              p { margin-bottom: 10px; }
              .otp-code { font-size: 2.5rem; font-weight: bold; color: #d93025; letter-spacing: 8px; margin: 20px 0; text-align: center; padding: 10px; background-color: #ffe0e0; border-radius: 5px; }
              .expiry-note { color: #555; font-size: 0.95rem; text-align: center; margin-top: 15px;}
              hr { border: none; border-top: 1px solid #eee; margin: 30px 0; }
              .footer { font-size: 0.85rem; color: #999; text-align: center; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Password Reset OTP</h2>
              <p>Use the following code to reset your password for your ${APP_NAME} account:</p>
              <div class="otp-code">${otp}</div>
              <p class="expiry-note">This code will expire in <strong>10 minutes</strong>.</p>
              <hr>
              <p class="footer">If you did not request a password reset, please ignore this email.</p>
              <p class="footer">${APP_NAME} Support Team</p>
          </div>
      </body>
      </html>
    `;
    textContent = `
      Your ${APP_NAME} Password Reset Code:

      Use the following code to reset your password:

      ${otp}

      This code will expire in 10 minutes.

      If you did not request a password reset, please ignore this email.

      ${APP_NAME} Support Team
    `;
  } else {
    // Fallback for unhandled types, though Zod should prevent this if used
    console.warn(`[sendOTPEmail] Unknown OTP type: ${type}. Sending generic email.`);
    subject = `${APP_NAME} - Your Verification Code`;
    htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
          <style>
              body { ${baseHtmlStyles} margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
              h2 { color: #1a73e8; margin-bottom: 15px; text-align: center; }
              p { margin-bottom: 10px; }
              .otp-code { font-size: 2.5rem; font-weight: bold; color: #1a73e8; letter-spacing: 8px; margin: 20px 0; text-align: center; padding: 10px; background-color: #e8f0fe; border-radius: 5px; }
              .footer { font-size: 0.85rem; color: #999; text-align: center; margin-top: 20px; }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Your Verification Code</h2>
              <p>Here is your verification code:</p>
              <div class="otp-code">${otp}</div>
              <hr>
              <p class="footer">${APP_NAME} Support Team</p>
          </div>
      </body>
      </html>
    `;
    textContent = `
      Your ${APP_NAME} Verification Code:

      Here is your verification code:

      ${otp}

      ${APP_NAME} Support Team
    `;
  }

  const mailOptions: Mail.Options = {
    from: `"${APP_NAME} Support" <${APP_EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
    text: textContent, // Add plain text version
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} for ${type}.`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`Failed to send ${type} email to ${to}:`, errorMessage, error);
    throw new Error(`Failed to send email: ${errorMessage}`); // Re-throw to propagate error
  }
}

/**
 * Sends a success email after email verification.
 * @param to The recipient's email address.
 * @param name The user's name (optional).
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
export async function sendVerificationSuccessEmail(to: string, name?: string): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verified!</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            h2 { color: #1a73e8; margin-bottom: 15px; text-align: center; }
            p { margin-bottom: 10px; }
            .footer { font-size: 0.85rem; color: #999; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Congratulations${name ? `, ${name}` : ""}!</h2>
            <p>Your email address for ${APP_NAME} has been successfully verified.</p>
            <p>Thank you for joining us!</p>
            <p class="footer">${APP_NAME} Support Team</p>
        </div>
    </body>
    </html>
  `;

  const textContent = `
    Congratulations${name ? `, ${name}` : ""}!

    Your email address for ${APP_NAME} has been successfully verified.
    Thank you for joining us!

    ${APP_NAME} Support Team
  `;

  const mailOptions: Mail.Options = {
    from: `"${APP_NAME} Support" <${APP_EMAIL_USER}>`,
    to,
    subject: `${APP_NAME} - Email Verified Successfully 🎉`,
    html: htmlContent,
    text: textContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification success email sent to ${to}.`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`Failed to send verification success email to ${to}:`, errorMessage, error);
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}

/**
 * Sends a success email after a password reset.
 * @param to The recipient's email address.
 * @param name The user's name (optional).
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
export async function sendPasswordResetSuccessEmail(to: string, name?: string): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            h2 { color: #d93025; margin-bottom: 15px; text-align: center; }
            p { margin-bottom: 10px; }
            .footer { font-size: 0.85rem; color: #999; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hello${name ? `, ${name}` : ""}!</h2>
            <p>This is to confirm that your password for your ${APP_NAME} account was reset successfully.</p>
            <p>If you did not initiate this, please contact support immediately.</p>
            <p class="footer">${APP_NAME} Support Team</p>
        </div>
    </body>
    </html>
  `;

  const textContent = `
    Hello${name ? `, ${name}` : ""}!

    This is to confirm that your password for your ${APP_NAME} account was reset successfully.
    If you did not initiate this, please contact support immediately.

    ${APP_NAME} Support Team
  `;

  const mailOptions: Mail.Options = {
    from: `"${APP_NAME} Support" <${APP_EMAIL_USER}>`,
    to,
    subject: `${APP_NAME} - Password Reset Successful`,
    html: htmlContent,
    text: textContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset success email sent to ${to}.`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error(`Failed to send password reset success email to ${to}:`, errorMessage, error);
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}
