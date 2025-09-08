// templates/emails/emailVerification.ts

export const emailVerificationTemplate = (username: string, link: string): string => `
  <div style="font-family: Arial, sans-serif; color: #111827;">
    <h2 style="font-size: 20px; margin-bottom: 12px;">Verify Your Email</h2>
    <p style="margin: 0 0 16px;">Hi <strong>${username}</strong>,</p>
    <p style="margin-bottom: 20px;">
      Thanks for signing up! Please verify your email by clicking the button below:
    </p>
    <a
      href="${link}"
      style="
        display: inline-block;
        background-color: #16a34a;
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        text-decoration: none;
        margin-bottom: 20px;
      "
    >
      Verify Email
    </a>
    <p style="font-size: 14px; color: #6b7280;">
      If you didn’t sign up for this account, you can ignore this message.
    </p>
    <p style="margin-top: 32px;">– The YourApp Team</p>
  </div>
`;
