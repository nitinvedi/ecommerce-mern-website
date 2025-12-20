import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import { allowedOrigins } from "../config/cors.js";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Join admin room if user is admin
    if (socket.userRole === "admin") {
      socket.join("admins");
    }

    // Handle typing indicator
    socket.on("typing", (data) => {
      io.to(`user:${data.receiver}`).emit("user_typing", {
        userId: socket.userId
      });
    });

    socket.on("stop_typing", (data) => {
      io.to(`user:${data.receiver}`).emit("user_stop_typing", {
        userId: socket.userId
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Helper function to emit chat message
export const emitChatMessage = (messageData) => {
  if (!io) return;

  const { sender, receiver, message, senderRole, _id, createdAt } = messageData;
  const receiverId = receiver.toString();
  const senderId = sender.toString();
  const messageId = _id.toString();

  console.log(`[Socket] Emitting message ${messageId} from ${senderId} to ${receiverId}`);

  // 1. Send to receiver
  io.to(`user:${receiverId}`).emit("receive_message", {
    _id: messageId,
    sender: senderId,
    message,
    senderRole,
    timestamp: createdAt
  });

    // 2. Broadcast to admins
  if (senderRole === 'user') {
    io.to(`user:${receiverId}`).emit("new_customer_message", {
      _id: messageId,
      sender: senderId,
      message,
      timestamp: createdAt
    });
  } else if (senderRole === 'admin') {
    io.to("admins").emit("receive_message", {
      _id: messageId,
      sender: senderId, // This is the admin ID
      receiver: receiverId, // Important: This is the User ID
      message,
      senderRole,
      timestamp: createdAt
    });
  }

  // 3. Send back to sender (for multi-device sync or confirmation)
  io.to(`user:${sender}`).emit("receive_message", {
    _id,
    sender,
    message,
    senderRole,
    timestamp: createdAt
  });
};

// Helper function to emit notification to specific user
export const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit("new_notification", notification);
  }
};

// Helper function to emit notification to all admins
export const emitAdminNotification = (notification) => {
  if (io) {
    io.to("admins").emit("new_notification", notification);
  }
};

export default {
  initializeSocket,
  getIO,
  emitChatMessage,
  emitNotification,
  emitAdminNotification
};
