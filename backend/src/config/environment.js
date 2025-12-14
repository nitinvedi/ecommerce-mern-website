import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
export const validateEnv = () => {
  const required = [
    "MONGO_URI",
    "JWT_SECRET"
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((key) => console.error(`   - ${key}`));
    throw new Error("Missing required environment variables");
  }

  // Warn about missing optional but recommended variables
  const recommended = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "SMTP_USER",
    "SMTP_PASS"
  ];

  const missingRecommended = recommended.filter((key) => !process.env[key]);
  
  if (missingRecommended.length > 0 && process.env.NODE_ENV === "production") {
    console.warn("⚠️  Missing recommended environment variables:");
    missingRecommended.forEach((key) => console.warn(`   - ${key}`));
  }

  console.log("✅ Environment variables validated");
};

// Get environment variable with default
export const getEnv = (key, defaultValue = null) => {
  return process.env[key] || defaultValue;
};

// Check if environment variable exists
export const hasEnv = (key) => {
  return !!process.env[key];
};

// Environment info
export const envInfo = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development" || !process.env.NODE_ENV,
  isTest: process.env.NODE_ENV === "test"
};

export default {
  validateEnv,
  getEnv,
  hasEnv,
  envInfo
};

