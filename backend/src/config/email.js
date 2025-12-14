// Email Configuration
// Note: Install nodemailer if you want to use email functionality
// npm install nodemailer

export const emailConfig = {
  // SMTP Configuration
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  },
  
  // Email Settings
  from: process.env.EMAIL_FROM || "noreply@repair-ecommerce.com",
  fromName: process.env.EMAIL_FROM_NAME || "Repair E-commerce",
  
  // Email Templates
  templates: {
    welcome: "welcome",
    passwordReset: "password-reset",
    orderConfirmation: "order-confirmation",
    orderShipped: "order-shipped",
    repairConfirmation: "repair-confirmation",
    repairStatusUpdate: "repair-status-update"
  },
  
  // Enable/Disable
  enabled: process.env.EMAIL_ENABLED === "true"
};

// Create nodemailer transporter (if email is enabled)
export const createEmailTransporter = async () => {
  if (!emailConfig.enabled) {
    return null;
  }
  
  try {
    const { createTransport } = await import("nodemailer");
    
    return createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth.user ? {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      } : undefined
    });
  } catch (error) {
    console.error("Email transporter creation failed:", error);
    return null;
  }
};

// Send email helper
export const sendEmail = async (to, subject, html, text = null) => {
  if (!emailConfig.enabled) {
    console.log("Email disabled. Would send:", { to, subject });
    return { success: false, message: "Email is disabled" };
  }
  
  try {
    const transporter = createEmailTransporter();
    if (!transporter) {
      throw new Error("Email transporter not available");
    }
    
    const info = await transporter.sendMail({
      from: `"${emailConfig.fromName}" <${emailConfig.from}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
      html
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

export default emailConfig;

