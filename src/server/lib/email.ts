import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

const transporter = nodemailer.createTransport(process.env.EMAIL_SERVER);

export function generateTemporaryPassword(): string {
  return randomBytes(6).toString("base64url");
}

export async function sendPasswordResetEmail(
  email: string,
  temporaryPassword: string
): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your Temporary Password - YourStyle AI",
    text: `Your temporary password is: ${temporaryPassword}\n\nThis password will expire in 1 hour.\n\nPlease log in and change your password immediately.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a temporary password for your YourStyle AI account.</p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">Your temporary password:</p>
          <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #333; letter-spacing: 2px;">${temporaryPassword}</p>
        </div>
        <p style="color: #666; font-size: 14px;">This password will expire in <strong>1 hour</strong>.</p>
        <p style="color: #666; font-size: 14px;">Please log in and change your password immediately for security.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">If you did not request this password reset, please ignore this email.</p>
      </div>
    `,
  });
}
