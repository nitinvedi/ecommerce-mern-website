import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as chatController from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send message
router.post("/send", chatController.sendMessage);

// Get messages with specific user
router.get("/messages/:userId", chatController.getMessages);

// Get all conversations
router.get("/conversations", chatController.getConversations);

// Get unread count
router.get("/unread-count", chatController.getUnreadCount);

// Get support admin
router.get("/support-admin", chatController.getSupportAdmin);

// Delete conversation
router.delete("/conversations/:userId", chatController.deleteConversation);

export default router;
