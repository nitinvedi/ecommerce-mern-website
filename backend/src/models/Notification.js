import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "notifications";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Create notification
export const createNotification = async (notificationData) => {
  const notification = {
    user: typeof notificationData.user === 'string' 
      ? new ObjectId(notificationData.user) 
      : notificationData.user,
    type: notificationData.type || 'system', // order, repair, system, promotion
    title: notificationData.title,
    message: notificationData.message,
    link: notificationData.link || null,
    isRead: false,
    createdAt: new Date()
  };
  
  const collection = getCollection();
  const result = await collection.insertOne(notification);
  return { ...notification, _id: result.insertedId };
};

// Get notifications by user
export const getNotificationsByUser = async (userId, limit = 50) => {
  const collection = getCollection();
  return await collection
    .find({ user: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
};

// Get unread count
export const getUnreadCount = async (userId) => {
  const collection = getCollection();
  return await collection.countDocuments({
    user: new ObjectId(userId),
    isRead: false
  });
};

// Mark as read
export const markAsRead = async (notificationId) => {
  const collection = getCollection();
  return await collection.updateOne(
    { _id: new ObjectId(notificationId) },
    { $set: { isRead: true } }
  );
};

// Mark all as read
export const markAllAsRead = async (userId) => {
  const collection = getCollection();
  return await collection.updateMany(
    { user: new ObjectId(userId), isRead: false },
    { $set: { isRead: true } }
  );
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(notificationId) });
};

// Delete old notifications (older than 30 days)
export const deleteOldNotifications = async () => {
  const collection = getCollection();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return await collection.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    isRead: true
  });
};

export default {
  createNotification,
  getNotificationsByUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteOldNotifications
};
