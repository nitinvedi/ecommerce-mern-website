import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendNotFound } from "../utils/response.js";
import * as UserModel from "../models/User.js";
import logger from "../utils/logger.js";
import { sendEmail } from "../config/email.js";

/* ================= CONTACT SUPPORT ================= */

// Public contact form → send email
export const contactSupport = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return sendError(res, "Name, email and message are required", 400);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6">
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr />
      <p style="font-size: 12px; color: #666">
        Sent from Marammat website contact form
      </p>
    </div>
  `;

  try {
    await sendEmail({
      to: process.env.EMAIL_FROM || process.env.SMTP_USER,
      subject: "New Contact Message – Marammat",
      html
    });

    return sendSuccess(res, "Message sent successfully");
  } catch (err) {
    logger.error("Contact email failed", err);
    return sendError(res, "Failed to send message", 500);
  }
});

/* ================= USER PROFILE ================= */

// Get my profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const user = await UserModel.getUserById(userId);

  if (!user) {
    return sendNotFound(res, "User");
  }

  return sendSuccess(res, "Profile retrieved successfully", user);
});

// Update my profile
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const updateData = req.body;

  // Don't allow role updates through this endpoint
  delete updateData.role;

  const result = await UserModel.updateUser(userId, updateData);

  if (result.modifiedCount === 0) {
    return sendError(res, "Profile not updated", 400);
  }

  const updatedUser = await UserModel.getUserById(userId);
  return sendSuccess(res, "Profile updated successfully", updatedUser);
});

// Get user by ID (admin only)
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.getUserById(id);

  if (!user) {
    return sendNotFound(res, "User");
  }

  return sendSuccess(res, "User retrieved successfully", user);
});

// Get all users (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.role) {
    filter.role = req.query.role;
  }

  const users = await UserModel.getAllUsers(filter);
  return sendSuccess(res, "Users retrieved successfully", users);
});

// Update user (admin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.getUserById(id);

  if (!user) {
    return sendNotFound(res, "User");
  }

  const result = await UserModel.updateUser(id, req.body);

  if (result.modifiedCount === 0) {
    return sendError(res, "User not updated", 400);
  }

  const updatedUser = await UserModel.getUserById(id);
  return sendSuccess(res, "User updated successfully", updatedUser);
});

// Delete user (admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await UserModel.getUserById(id);

  if (!user) {
    return sendNotFound(res, "User");
  }

  if (id === req.user._id.toString()) {
    return sendError(res, "Cannot delete your own account", 400);
  }

  await UserModel.deleteUser(id);
  return sendSuccess(res, "User deleted successfully");
});
