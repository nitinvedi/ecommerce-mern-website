// Application Configuration
export const appConfig = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  apiVersion: process.env.API_VERSION || "v1",
  
  // Application
  appName: process.env.APP_NAME || "Repair E-commerce",
  appUrl: process.env.APP_URL || "http://localhost:5000",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  
  // Security
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  sessionSecret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  uploadPath: process.env.UPLOAD_PATH || "./uploads",
  allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(",") || [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp"
  ],
  
  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 10,
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE) || 100,
  
  // Rate Limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || "info",
  enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== "false",
  
  // Features
  enableGoogleAuth: process.env.ENABLE_GOOGLE_AUTH !== "false",
  enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === "true",
  enablePasswordReset: process.env.ENABLE_PASSWORD_RESET !== "false"
};

// Check if running in production
export const isProduction = () => appConfig.nodeEnv === "production";
export const isDevelopment = () => appConfig.nodeEnv === "development";
export const isTest = () => appConfig.nodeEnv === "test";

export default appConfig;

