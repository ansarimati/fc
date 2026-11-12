const nodemailer = require(nodemailer);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an HTML email.
 * @param {Object} options - { to, subject, html }
 */

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Farooqui Computers" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    // Don't throw — email failure shouldn't crash the request flow
  }
};

/** Pre-built email templates */
export const emailTemplates = {
  otpVerification: (name, otp) => `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color:#2563eb;">TechBazaar</h2>
      <p>Hi ${name},</p>
      <p>Your OTP for verification is:</p>
      <h1 style="letter-spacing: 8px; color:#2563eb;">${otp}</h1>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      <p style="color:#94a3b8; font-size:12px;">If you didn't request this, please ignore this email.</p>
    </div>
  `,
  resetPassword: (name, resetUrl) => `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color:#2563eb;">TechBazaar</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset. Click the button below to set a new password:</p>
      <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background:#2563eb; color:white; text-decoration:none; border-radius:8px; margin:16px 0;">Reset Password</a>
      <p style="color:#94a3b8; font-size:12px;">This link expires in 30 minutes. If you didn't request this, please ignore this email.</p>
    </div>
  `,
  orderConfirmation: (name, orderNumber, total) => `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color:#2563eb;">TechBazaar</h2>
      <p>Hi ${name},</p>
      <p>Thank you for your order! 🎉</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Total:</strong> ₹${total.toLocaleString("en-IN")}</p>
      <p>We'll notify you once your order is shipped.</p>
    </div>
  `,
};

export default sendEmail;