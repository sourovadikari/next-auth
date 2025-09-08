export const emailVerifiedTemplate = (username: string): string => `
  <div style="font-family: Arial, sans-serif; color: #111827;">
    <h2>Email Verified Successfully</h2>
    <p>Hi <strong>${username}</strong>,</p>
    <p>Your email address has now been verified. You now have full access to your account.</p>
    <p>If you didn’t request this or have questions, please contact our support team.</p>
    <p style="margin-top: 32px;">– The YourApp Team</p>
  </div>
`;
