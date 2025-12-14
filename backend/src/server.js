import dotenv from "dotenv";
import http from "http";

// Load environment variables
dotenv.config();

// Import configs
import { validateEnv } from "./config/environment.js";
import { connectDB, closeDB } from "./config/mongo.js";
import { initializeSocket } from "./config/socket.js";
import appConfig from "./config/app.js";
import logger from "./utils/logger.js";

// Import app
import app from "./app.js";

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error("Environment validation failed", error);
  process.exit(1);
}

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Get port from config
const PORT = appConfig.port;

// Connect to MongoDB
connectDB()
  .then(() => {
    logger.info("MongoDB connection established");
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📦 Environment: ${appConfig.nodeEnv}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api/${appConfig.apiVersion}`);
      logger.info(`📝 Health Check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    logger.error("Failed to start server", error);
    process.exit(1);
  });

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info("HTTP server closed");
    
    try {
      await closeDB();
      logger.info("Database connection closed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown", error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});
