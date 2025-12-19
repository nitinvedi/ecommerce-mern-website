import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

  // 1. Send to receiver
  io.to(`user:${receiver}`).emit("receive_message", {
    _id,
    sender,
    message,
    senderRole,
    timestamp: createdAt
  });

    // 2. Broadcast to admins
  if (senderRole === 'user') {
    // Only notify the specific receiver (Master Admin), which is handled by step 1 above.
    // We removed the general broadcast to "admins" room to restrict access.
    // If you want to ensure the Master Admin gets a specific "notification" event beyond "receive_message":
    io.to(`user:${receiver}`).emit("new_customer_message", {
      _id,
      sender,
      message,
      timestamp: createdAt
    });
  } else if (senderRole === 'admin') {
    // If sender is admin, notify OTHER admins (so they see the reply)
    // We send to "admins" room. The sender is also in this room, so frontend needs to handle duplicates (which it already does)
    io.to("admins").emit("receive_message", {
      _id,
      sender, // This is the admin ID, but for the conversation view on other admins, we might need context.
              // Actually, other admins viewing this user's chat need to see this message.
              // The "receiver" is the User. 
      // For AdminChat.jsx, it listens to "receive_message". 
      // It uses the sender ID to place it. If sender is Admin A, Admin B needs to know who it was sent TO?
      // Wait, AdminChat usually shows messages *from* the selected user.
      // If Admin A sends to User U, Admin B viewing User U should see it.
      // But the message object usually has sender/receiver.
      // Let's send the full object or enough info.
      receiver, // Important: This is the User ID
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
