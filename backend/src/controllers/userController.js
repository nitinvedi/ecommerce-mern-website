import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendNotFound } from "../utils/response.js";
import * as UserModel from "../models/User.js";
import logger from "../utils/logger.js";

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

  // Filter by role
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

  // Prevent deleting yourself
  if (id === req.user._id.toString()) {
    return sendError(res, "Cannot delete your own account", 400);
  }

  await UserModel.deleteUser(id);
  return sendSuccess(res, "User deleted successfully");
});

