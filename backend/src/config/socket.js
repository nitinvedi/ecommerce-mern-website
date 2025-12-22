import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

// Initialize Socket.IO
export const initializeSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.FRONTEND_URL_ALT || "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
  ];

  if (process.env.PRODUCTION_URL) {
    allowedOrigins.push(process.env.PRODUCTION_URL);
  }

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
          callback(null, true);
        } else {
          // Dynamic check: allow if it matches the deployments domain pattern if applicable
          // For now, let's trust the allowedOrigins list + manually added production URL
          // But safer: just allow the origin if it matches the current server's domain? 
          // Socket.io CORS is strict. Let's add a wildcard for subdomains if needed or just log the rejection.
          console.log("Cors Origin Rejection:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Middleware: Authenticate Socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // { id, role, ... }
        next();
      } catch (err) {
        console.error("Socket auth error:", err.message);
        next(new Error("Authentication error"));
      }
    } else {
      next(); // Allow public connections (if any needed), but they won't have socket.user
    }
  });

  // Connection handling
  io.on("connection", (socket) => {
    // Join User Room & Role Room
    if (socket.user) {
      const userId = socket.user.id || socket.user._id; // Accommodate different payload shapes
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`✅ Client ${socket.id} authenticated as User ${userId}`);
      }

      // Join Role Room (admin, technician, etc.)
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
        console.log(`✅ Client ${socket.id} joined role room: role:${socket.user.role}`);
      }
    } else {
      console.log(`Client ${socket.id} connected (Guest)`);
    }

    // Join repair room for live updates
    socket.on("join_repair", (repairId) => {
      socket.join(`repair:${repairId}`);
      console.log(`Client ${socket.id} joined repair room: ${repairId}`);
    });

    // Leave repair room
    socket.on("leave_repair", (repairId) => {
      socket.leave(`repair:${repairId}`);
      console.log(`Client ${socket.id} left repair room: ${repairId}`);
    });

    // Join order room
    socket.on("join_order", (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`Client ${socket.id} joined order room: ${orderId}`);
    });

    // Leave order room
    socket.on("leave_order", (orderId) => {
      socket.leave(`order:${orderId}`);
      console.log(`Client ${socket.id} left order room: ${orderId}`);
    });

    // Disconnect handling
    socket.on("disconnect", () => {
      // console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
};

// Get Socket.IO instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initializeSocket() first.");
  }
  return io;
};

// Emit repair status update
export const emitRepairUpdate = (repairId, data) => {
  if (io) {
    io.to(`repair:${repairId}`).emit("repair_update", {
      repairId,
      status: data.status,
      note: data.note,
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

// Emit order status update
export const emitOrderUpdate = (orderId, data) => {
  if (io) {
    io.to(`order:${orderId}`).emit("order_update", {
      orderId,
      status: data.status,
      message: data.message,
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

// Emit User Notification
export const emitNotification = (userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit("new_notification", notification);
    console.log(`[Socket] Emitted notification to user:${userId}`);
  }
};

// Emit to specific role
export const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
    console.log(`[Socket] Emitted ${event} to role:${role}`);
  }
}

// Emit to specific user
export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
    console.log(`[Socket] Emitted ${event} to user:${userId}`);
  }
}

// Broadcast to all connected clients
export const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export default {
  initializeSocket,
  getIO,
  emitRepairUpdate,
  emitOrderUpdate,
  emitNotification,
  emitToRole,
  emitToUser,
  broadcast
};

