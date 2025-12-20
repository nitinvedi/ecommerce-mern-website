import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Config imports
import { corsOptions } from "./config/cors.js";
import appConfig from "./config/app.js";
import { validateEnv } from "./config/environment.js";

// Middleware imports
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { requestLogger, errorLogger } from "./middleware/loggerMiddleware.js";
import { apiRateLimit } from "./middleware/rateLimitMiddleware.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import repairRoutes from "./routes/repairRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
// New routes
import wishlistRoutes from "./routes/wishlistRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment variables
validateEnv();

const app = express();

// Trust proxy (for rate limiting and IP detection)
app.set("trust proxy", 1);

// CORS
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
if (appConfig.enableRequestLogging) {
  app.use(requestLogger);
}

// Rate limiting
app.use(apiRateLimit);

// Serve static files (uploads)
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: appConfig.nodeEnv
  });
});

// API routes
const apiPrefix = `/api/${appConfig.apiVersion}`;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/repairs`, repairRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
// New routes
app.use(`${apiPrefix}/wishlist`, wishlistRoutes);
app.use(`${apiPrefix}/notifications`, notificationRoutes);
app.use(`${apiPrefix}/addresses`, addressRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/chat`, chatRoutes);

// Serve frontend in production
if (appConfig.nodeEnv === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  app.use(express.static(frontendPath));
  
  // Serve frontend for all non-API routes (SPA Fallback)
  app.use((req, res) => {
    // Don't serve frontend for API routes
    if (req.path.startsWith("/api")) {
      return notFound(req, res, () => {});
    }
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  // Development: API root endpoint
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Repair E-commerce API",
      version: appConfig.apiVersion,
      documentation: `${req.protocol}://${req.get("host")}/api/${appConfig.apiVersion}/docs`
    });
  });
}

// 404 handler (only for API routes in development)
if (appConfig.nodeEnv !== "production") {
  app.use(notFound);
}

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(errorHandler);

export default app;
