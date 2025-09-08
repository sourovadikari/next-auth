// templates/emails/passwordReset.ts

export const passwordResetTemplate = (username: string, link: string): string => `
  <div style="font-family: Arial, sans-serif; color: #111827;">
    <h2 style="font-size: 20px; margin-bottom: 12px;">Password Reset Request</h2>
    <p style="margin: 0 0 16px;">Hi <strong>${username}</strong>,</p>
    <p style="margin-bottom: 20px;">
      You requested to reset your password. Click the button below to reset it:
    </p>
    <a
      href="${link}"
      style="
        display: inline-block;
        background-color: #1d4ed8;
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        font-weight: 600;
        text-decoration: none;
        margin-bottom: 20px;
      "
    >
      Reset Password
    </a>
    <p style="font-size: 14px; color: #6b7280;">
      If you didn’t request this, you can safely ignore this email.
    </p>
    <p style="margin-top: 32px;">– The YourApp Team</p>
  </div>
`;
