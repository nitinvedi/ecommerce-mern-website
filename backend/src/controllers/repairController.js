import { asyncHandler } from "../middleware/errorMiddleware.js";
import { sendSuccess, sendError, sendNotFound, sendCreated, sendPaginated } from "../utils/response.js";
import * as RepairModel from "../models/Repair.js";
import { emitRepairUpdate } from "../config/socket.js";
import logger from "../utils/logger.js";

// Create repair request
export const createRepair = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const repairData = {
    ...req.body,
    user: userId
  };

  // Add images if uploaded
  if (req.files && req.files.length > 0) {
    repairData.images = req.files.map(file => file.path);
  }

  const repair = await RepairModel.createRepair(repairData);

  // Emit socket event for new repair
  emitRepairUpdate(repair._id.toString(), {
    status: repair.status,
    note: "Repair request created"
  });

  return sendCreated(res, "Repair request created successfully", repair);
});

// Get my repairs
export const getMyRepairs = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const repairs = await RepairModel.getRepairsByUser(userId);
  return sendSuccess(res, "Repairs retrieved successfully", repairs);
});

// Get all repairs (admin/technician)
export const getAllRepairs = asyncHandler(async (req, res) => {
  const filter = {};

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by technician
  if (req.query.technician) {
    // Allow "me" alias for technician users
    filter.technician =
      req.query.technician === "me" ? req.user._id.toString() : req.query.technician;
  }

  // Filter by device type
  if (req.query.deviceType) {
    filter.deviceType = req.query.deviceType;
  }

  const repairs = await RepairModel.getAllRepairs(filter);
  return sendSuccess(res, "Repairs retrieved successfully", repairs);
});

// Get repair by ID
export const getRepairById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const userRole = req.user.role;

  const repair = await RepairModel.getRepairById(id);

  if (!repair) {
    return sendNotFound(res, "Repair");
  }

  // Check authorization
  if (repair.user.toString() !== userId && userRole !== "admin" && userRole !== "technician") {
    return sendError(res, "Not authorized to view this repair", 403);
  }

  return sendSuccess(res, "Repair retrieved successfully", repair);
});

// Get repair by tracking ID
export const getRepairByTrackingId = asyncHandler(async (req, res) => {
  const { trackingId } = req.params;
  const repair = await RepairModel.getRepairByTrackingId(trackingId);

  if (!repair) {
    return sendNotFound(res, "Repair");
  }

  return sendSuccess(res, "Repair retrieved successfully", repair);
});

// Update repair
export const updateRepair = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const userRole = req.user.role;

  const repair = await RepairModel.getRepairById(id);

  if (!repair) {
    return sendNotFound(res, "Repair");
  }

  // Check authorization
  if (repair.user.toString() !== userId && userRole !== "admin" && userRole !== "technician") {
    return sendError(res, "Not authorized to update this repair", 403);
  }

  const result = await RepairModel.updateRepair(id, req.body);

  if (result.modifiedCount === 0) {
    return sendError(res, "Repair not updated", 400);
  }

  const updatedRepair = await RepairModel.getRepairById(id);

  // Emit socket event
  if (req.body.status) {
    emitRepairUpdate(id, {
      status: req.body.status,
      note: req.body.note || "Repair status updated"
    });
  }

  return sendSuccess(res, "Repair updated successfully", updatedRepair);
});

// Add status update
export const addStatusUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const userId = req.user._id.toString();

  const repair = await RepairModel.getRepairById(id);

  if (!repair) {
    return sendNotFound(res, "Repair");
  }

  const statusUpdate = await RepairModel.addStatusUpdate(id, status, note, userId);

  // Emit socket event
  emitRepairUpdate(id, {
    status,
    note: note || ""
  });

  return sendSuccess(res, "Status updated successfully", statusUpdate);
});

// Delete repair
export const deleteRepair = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id.toString();
  const userRole = req.user.role;

  const repair = await RepairModel.getRepairById(id);

  if (!repair) {
    return sendNotFound(res, "Repair");
  }

  // Only admin can delete
  if (userRole !== "admin") {
    return sendError(res, "Not authorized to delete this repair", 403);
  }

  await RepairModel.deleteRepair(id);
  return sendSuccess(res, "Repair deleted successfully");
});

