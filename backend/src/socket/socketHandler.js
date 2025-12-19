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

    // Handle chat message
    socket.on("send_message", async (data) => {
      try {
        const { receiver, message } = data;
        
        // Emit to receiver
        io.to(`user:${receiver}`).emit("receive_message", {
          sender: socket.userId,
          message,
          timestamp: new Date()
        });

        // Also emit to all admins if receiver is admin
        if (data.receiverRole === "admin") {
          io.to("admins").emit("new_customer_message", {
            sender: socket.userId,
            message,
            timestamp: new Date()
          });
        }

        // Emit back to sender for confirmation
        socket.emit("message_sent", {
          receiver,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit("message_error", { error: error.message });
      }
    });

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
  emitNotification,
  emitAdminNotification
};
