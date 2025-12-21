import * as Notification from "../models/Notification.js";
import { sendEmail, emailTemplates } from "../utils/emailService.js";
import { emitNotification } from "../socket/socketHandler.js";

// Get all notifications for user
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.getNotificationsByUser(req.user._id);
    res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.markAsRead(id);
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.deleteNotification(id);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ message: error.message });
  }
};



// Create notification (helper function)
export const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = await Notification.createNotification({
      user: userId,
      type,
      title,
      message,
      data
    });
    
    // Emit real-time notification
    if (notification) {
        emitNotification(userId, notification);
    }

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    return null;
  }
};

// Send notification (in-app + email)
export const sendNotification = async (user, type, title, message, emailTemplate = null) => {
  try {
    // Create in-app notification
    await createNotification(user._id, type, title, message);

    // Send email if template provided
    if (emailTemplate && user.email) {
      await sendEmail({
        to: user.email,
        ...emailTemplate
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Send notification error:", error);
    return { success: false, error: error.message };
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  sendNotification
};
