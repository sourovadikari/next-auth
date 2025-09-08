export const passwordResetConfirmedTemplate = (username: string): string => `
  <div style="font-family: Arial, sans-serif; color: #111827;">
    <h2>Password Changed</h2>
    <p>Hi <strong>${username}</strong>,</p>
    <p>This is a confirmation that your password has been successfully changed.</p>
    <p>If you did not perform this action, please contact our support team immediately.</p>
    <p style="margin-top: 32px;">– The YourApp Team</p>
  </div>
`;
