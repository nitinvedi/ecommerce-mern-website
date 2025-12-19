import { getDB } from "../config/mongo.js";
import { ObjectId } from "mongodb";

// Collection name
const COLLECTION_NAME = "chat_messages";

// Get collection
const getCollection = () => {
  const db = getDB();
  return db.collection(COLLECTION_NAME);
};

// Create message
export const createMessage = async (messageData) => {
  const message = {
    sender: typeof messageData.sender === 'string' 
      ? new ObjectId(messageData.sender) 
      : messageData.sender,
    receiver: typeof messageData.receiver === 'string' 
      ? new ObjectId(messageData.receiver) 
      : messageData.receiver,
    senderRole: messageData.senderRole || 'user', // user, admin, technician
    message: messageData.message.trim(),
    attachments: messageData.attachments || [],
    isRead: false,
    createdAt: new Date()
  };
  
  const collection = getCollection();
  const result = await collection.insertOne(message);
  return { ...message, _id: result.insertedId };
};

// Get messages between two users
export const getMessagesBetweenUsers = async (userId1, userId2, limit = 100) => {
  const collection = getCollection();
  
  return await collection
    .find({
      $or: [
        { sender: new ObjectId(userId1), receiver: new ObjectId(userId2) },
        { sender: new ObjectId(userId2), receiver: new ObjectId(userId1) }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray();
};

// Get user conversations (list of users they've chatted with)
export const getUserConversations = async (userId) => {
  const collection = getCollection();
  
  const messages = await collection
    .find({
      $or: [
        { sender: new ObjectId(userId) },
        { receiver: new ObjectId(userId) }
      ]
    })
    .sort({ createdAt: -1 })
    .toArray();
  
  // Get unique conversation partners
  const conversationPartners = new Set();
  messages.forEach(msg => {
    const partnerId = msg.sender.toString() === userId.toString() 
      ? msg.receiver.toString() 
      : msg.sender.toString();
    conversationPartners.add(partnerId);
  });
  
  return Array.from(conversationPartners);
};

// Get unread count
export const getUnreadCount = async (userId) => {
  const collection = getCollection();
  
  return await collection.countDocuments({
    receiver: new ObjectId(userId),
    isRead: false
  });
};

// Mark messages as read
export const markAsRead = async (userId, senderId) => {
  const collection = getCollection();
  
  return await collection.updateMany(
    {
      receiver: new ObjectId(userId),
      sender: new ObjectId(senderId),
      isRead: false
    },
    { $set: { isRead: true } }
  );
};

// Delete message
export const deleteMessage = async (messageId) => {
  const collection = getCollection();
  return await collection.deleteOne({ _id: new ObjectId(messageId) });
};

// Get message by ID
export const getMessageById = async (messageId) => {
  const collection = getCollection();
  return await collection.findOne({ _id: new ObjectId(messageId) });
};

export default {
  createMessage,
  getMessagesBetweenUsers,
  getUserConversations,
  getUnreadCount,
  markAsRead,
  deleteMessage,
  getMessageById
};
