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

  // Notify Customer (Email)
  const { sendEmail, emailTemplates } = await import("../utils/emailService.js");
  const user = await (await import("../models/User.js")).default.getUserById(userId);
  await sendEmail({
       to: user.email,
       ...emailTemplates.repairUpdate(
           { ...repair, fullName: user.name }, 
           "Repair Request Received",
           "We have received your repair request and will review it shortly."
       )
  });

  // Create In-App Notification
  const NotificationModel = (await import("../models/Notification.js")).default;
  const { emitNotification } = await import("../config/socket.js");
  
  const newNotif = await NotificationModel.createNotification({
      user: userId,
      type: 'repair',
      title: "Repair Request Received",
      message: `Your repair request (${repair.trackingId}) has been received.`,
      link: `/repair/${repair.insertedId || repair._id}` 
  });
  
  if (newNotif) {
      emitNotification(userId, newNotif);
  }

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
  const { role, _id } = req.user;

  // Security: If technician, force filter to assigned repairs only, UNLESS explicitly asking for unassigned
  if (role === "technician") {
     if (req.query.technician === "null") {
        // Allow seeing unassigned jobs
        filter.technician = null;
     } else {
        // Default to own jobs
        filter.technician = _id.toString();
     }
  }

  // Filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filter by technician (Admin override or explicit filter)
  if (role === "admin" && req.query.technician) {
    // Allow "me" alias for admin users too if they really want
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

  // Handle unassignment explicitly
  if (req.body.technician === null || req.body.technician === "") {
    req.body.technician = null;
  }

  // Email Notification & Validation for Assignment
  if (req.body.technician && req.body.technician !== repair.technician?.toString()) {
      const User = (await import("../models/User.js")).default;
      const tech = await User.getUserById(req.body.technician);
      if (!tech) {
          return sendError(res, "Technician not found", 404);
      }
      if (tech.role !== "technician") {
          return sendError(res, "Assigned user is not a technician", 400);
      }
      
      const { sendEmail } = await import("../utils/emailService.js");
           await sendEmail({
               to: tech.email,
               subject: `New Job Assigned: ${repair.trackingId}`,
               html: `<p>You have been assigned a new repair job.</p><p>Device: ${repair.brand} ${repair.model}</p><p>Issue: ${repair.issue}</p>`,
               text: `You have been assigned a new repair job: ${repair.trackingId}`
           });
  }

  // --- 1. Detect Changes for Notifications ---
  const changes = [];
  
  // Status Change
  if (req.body.status && req.body.status !== repair.status) {
      changes.push({
          type: 'STATUS',
          title: `Status Updated: ${req.body.status}`,
          message: `Your repair status has changed to "${req.body.status}". ${req.body.note ? `Note: ${req.body.note}` : ''}`
      });
  }

  // Technician Assignment
  if (req.body.technician && req.body.technician !== repair.technician?.toString()) {
      changes.push({
          type: 'ASSIGNMENT',
          title: 'Technician Assigned',
          message: 'A technician has been assigned to your repair job and will begin working correctly.'
      });
  }

  // Cost Updates
  if (req.body.estimatedRepairCost && req.body.estimatedRepairCost !== repair.estimatedRepairCost) {
      changes.push({
          type: 'COST',
          title: 'Estimated Cost Updated',
          message: `The estimated cost for your repair has been updated to ₹${req.body.estimatedRepairCost}.`
      });
  }
  
  if (req.body.finalRepairCost && req.body.finalRepairCost !== repair.finalRepairCost) {
      changes.push({
          type: 'COST',
          title: 'Final Repair Cost',
          message: `The final repair cost has been set to ₹${req.body.finalRepairCost}.`
      });
  }

  // --- 2. Perform Update ---
  const result = await RepairModel.updateRepair(id, req.body);

  if (result.modifiedCount === 0) {
    return sendError(res, "Repair not updated", 400);
  }

  const updatedRepair = await RepairModel.getRepairById(id);

  // --- 3. Send Notifications (Async) ---
  // Notify Customer on Changes
  if (changes.length > 0) {
      console.log(`[Email Debug] Changes detected for Repair ${repair.trackingId}:`, changes);
      const { sendEmail, emailTemplates } = await import("../utils/emailService.js");
      
      for (const change of changes) {
           console.log(`[Email Debug] Sending email to ${updatedRepair.user?.email} for ${change.type}`);
           const result = await sendEmail({
               to: updatedRepair.user.email,
               ...emailTemplates.repairUpdate(updatedRepair, change.title, change.message)
           });
           console.log(`[Email Debug] Send Result:`, result);
      }
  }

  // --- 4. Create In-App Notifications ---
  if (changes.length > 0) {
      const NotificationModel = (await import("../models/Notification.js")).default;
      const { emitNotification } = await import("../config/socket.js");
      
      for (const change of changes) {
          const newNotif = await NotificationModel.createNotification({
              user: updatedRepair.user._id, // Ensure ObjectId
              type: 'repair',
              title: change.title,
              message: change.message,
              link: `/repair/${id}` // Or specific repair link
          });
          
          if (newNotif) {
             emitNotification(updatedRepair.user._id.toString(), newNotif);
          }
      }
  }

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

  // Notify Customer (Email)
  const { sendEmail, emailTemplates } = await import("../utils/emailService.js");
  await sendEmail({
       to: repair.user.email, 
       ...emailTemplates.repairUpdate(
           { ...repair, status }, 
           `Status Update: ${status}`,
           `Your repair status is now "${status}". ${note ? `Note: ${note}` : ''}`
       )
  });

  // Create In-App Notification
  const NotificationModel = (await import("../models/Notification.js")).default;
  const { emitNotification } = await import("../config/socket.js");
  
  const newNotif = await NotificationModel.createNotification({
      user: repair.user._id,
      type: 'repair',
      title: `Status Update: ${status}`,
      message: `Your repair status is now "${status}". ${note}`,
      link: `/repair/${id}`
  });
  
  if (newNotif) {
      emitNotification(repair.user._id.toString(), newNotif);
  }

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

