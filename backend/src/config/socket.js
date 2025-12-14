import { Server } from "socket.io";

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
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Connection handling
  io.on("connection", (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

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
      console.log(`❌ Client disconnected: ${socket.id}`);
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
  broadcast
};

