import nodemailer from "nodemailer";

// Email configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email notification
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: `"TechStore" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
};

// Email templates
export const emailTemplates = {
  orderPlaced: (order) => ({
    subject: `Order Confirmation - #${order._id.slice(-8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Order Confirmed! 🎉</h2>
        <p>Hi ${order.user.name},</p>
        <p>Thank you for your order. We've received it and will process it soon.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #${order._id.slice(-8)}</p>
          <p><strong>Total:</strong> ₹${order.totalPrice.toLocaleString()}</p>
          <p><strong>Items:</strong> ${order.orderItems.length}</p>
        </div>
        
        <p>We'll send you another email when your order ships.</p>
        <p>Best regards,<br>TechStore Team</p>
      </div>
    `,
    text: `Order Confirmed! Order ID: #${order._id.slice(-8)}. Total: ₹${order.totalPrice}`
  }),

  orderShipped: (order) => ({
    subject: `Your Order Has Shipped - #${order._id.slice(-8)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Your Order is On Its Way! 📦</h2>
        <p>Hi ${order.user.name},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Details</h3>
          <p><strong>Order ID:</strong> #${order._id.slice(-8)}</p>
          <p><strong>Tracking:</strong> Track your order in your dashboard</p>
        </div>
        
        <p>Expected delivery: 3-5 business days</p>
        <p>Best regards,<br>TechStore Team</p>
      </div>
    `,
    text: `Your order #${order._id.slice(-8)} has been shipped!`
  }),

  repairUpdate: (repair) => ({
    subject: `Repair Update - ${repair.trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Repair Status Update 🔧</h2>
        <p>Hi ${repair.fullName},</p>
        <p>Your repair request has been updated.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Repair Details</h3>
          <p><strong>Tracking ID:</strong> ${repair.trackingId}</p>
          <p><strong>Device:</strong> ${repair.deviceType} - ${repair.brand} ${repair.model}</p>
          <p><strong>Status:</strong> ${repair.status}</p>
        </div>
        
        <p>We'll keep you updated on the progress.</p>
        <p>Best regards,<br>TechStore Team</p>
      </div>
    `,
    text: `Repair ${repair.trackingId} status: ${repair.status}`
  }),

  welcomeEmail: (user) => ({
    subject: "Welcome to TechStore! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to TechStore!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining TechStore. We're excited to have you!</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Get Started</h3>
          <ul>
            <li>Browse our latest products</li>
            <li>Add items to your wishlist</li>
            <li>Enjoy fast delivery and warranty protection</li>
          </ul>
        </div>
        
        <p>Happy shopping!</p>
        <p>Best regards,<br>TechStore Team</p>
      </div>
    `,
    text: `Welcome to TechStore, ${user.name}!`
  })
};

export default {
  sendEmail,
  emailTemplates
};
