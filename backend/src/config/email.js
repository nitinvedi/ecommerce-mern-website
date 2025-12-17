import nodemailer from "nodemailer";

// Email Configuration
export const emailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  from: process.env.EMAIL_FROM || process.env.SMTP_USER,
  enabled: process.env.EMAIL_ENABLED === "true"
};

// Create transporter
export const createEmailTransporter = async () => {
  if (!emailConfig.enabled) {
    throw new Error("Email is disabled via EMAIL_ENABLED");
  }

  if (!emailConfig.auth.user || !emailConfig.auth.pass) {
    throw new Error("SMTP credentials missing");
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: emailConfig.auth
  });

  await transporter.verify();
  return transporter;
};

// Send email
export const sendEmail = async ({ to, subject, html }) => {
  const transporter = await createEmailTransporter();

  const info = await transporter.sendMail({
    from: `"Marammat Support" <${emailConfig.from}>`,
    to,
    subject,
    html
  });

  return info;
};
