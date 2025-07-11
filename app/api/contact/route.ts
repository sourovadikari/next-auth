import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod'; // Import Zod for robust validation

// Define Zod schema for the contact form input
const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email format.'),
  message: z.string().min(1, 'Message is required.'),
});

/**
 * Handles POST requests for the contact form submission.
 * Validates input, sends an email using Nodemailer, and returns a success or error response.
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json(); // Use 'unknown' for initial parsed body
    const parsed = contactFormSchema.safeParse(body); // Validate input with Zod

    // 1. Input Validation
    if (!parsed.success) {
      console.warn("[Contact API] Invalid input:", parsed.error.errors[0].message);
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 } // Bad Request for validation errors
      );
    }

    const { name, email, message } = parsed.data; // Destructure validated data

    // 2. Environment Variable Checks for Nodemailer
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailUser || !emailPass) {
      console.error("[Contact API] Server configuration error: EMAIL_USER or EMAIL_PASS is not defined.");
      return NextResponse.json(
        { success: false, error: "Server configuration error: Email credentials missing." },
        { status: 500 }
      );
    }

    // 3. Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or your preferred SMTP service
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      // Consider adding a timeout for production robustness
      // timeout: 10000, // 10 seconds
    });

    // 4. Send the email
    await transporter.sendMail({
      from: `"Website Contact Form" <${emailUser}>`, // Display name and sender email
      to: emailUser, // Send to your own email address
      replyTo: email, // Set reply-to to the sender's email for easy replies
      subject: `New Contact Message from ${name} (Website)`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0056b3;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff; text-decoration: none;">${email}</a></p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #007bff; padding: 15px; margin-top: 10px; border-radius: 4px;">
            <p>${message}</p>
          </div>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This message was sent from your website&apos;s contact form.
          </p>
        </div>
      `,
    });

    console.log(`[Contact API] Contact email sent successfully from ${email}.`);
    return NextResponse.json({ success: true, message: "Your message has been sent successfully!" }, { status: 200 });

  } catch (error: unknown) { // Use 'unknown' for caught errors
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error('[Contact API] Email send error:', errorMessage, error); // Log full error for debugging

    // Provide a generic error message to the client for security
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again later.' },
      { status: 500 } // Internal Server Error
    );
  }
}
