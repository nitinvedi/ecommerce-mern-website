import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get notifications
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark as read
router.put("/:id/read", notificationController.markAsRead);

// Mark all as read
router.put("/read-all", notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

export default router;
