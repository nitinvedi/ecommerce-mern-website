import * as ChatMessage from "../models/ChatMessage.js";
import * as User from "../models/User.js";

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { receiver, message } = req.body;
    
    if (!receiver || !message) {
      return res.status(400).json({ message: "Receiver and message are required" });
    }

    const messageData = {
      sender: req.user._id,
      receiver,
      senderRole: req.user.role || 'user',
      message
    };

    const newMessage = await ChatMessage.createMessage(messageData);
    
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get messages with a specific user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const messages = await ChatMessage.getMessagesBetweenUsers(
      req.user._id,
      userId
    );

    // Mark messages as read
    await ChatMessage.markAsRead(req.user._id, userId);

    res.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all conversations
export const getConversations = async (req, res) => {
  try {
    const partnerIds = await ChatMessage.getUserConversations(req.user._id);
    
    // Get user details for each partner
    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const partner = await User.getUserById(partnerId);
        const messages = await ChatMessage.getMessagesBetweenUsers(
          req.user._id,
          partnerId,
          1
        );
        
        return {
          partner: {
            _id: partner._id,
            name: partner.name,
            email: partner.email,
            role: partner.role
          },
          lastMessage: messages[messages.length - 1] || null
        };
      })
    );

    res.json({ conversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await ChatMessage.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get support admin (for customer support)
export const getSupportAdmin = async (req, res) => {
  try {
    // Find first admin user directly from database
    const { getDB } = await import("../config/mongo.js");
    const db = getDB();
    const admin = await db.collection("users").findOne({ role: "admin" });
    
    if (!admin) {
      return res.status(404).json({ message: "No support admin found" });
    }

    res.json({
      admin: {
        _id: admin._id,
        name: admin.name || "Support Team"
      }
    });
  } catch (error) {
    console.error("Get support admin error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  sendMessage,
  getMessages,
  getConversations,
  getUnreadCount,
  getSupportAdmin
};
