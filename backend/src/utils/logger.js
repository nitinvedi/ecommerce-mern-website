import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level (can be set via environment variable)
const currentLogLevel = process.env.LOG_LEVEL?.toUpperCase() || "INFO";
const logLevelValue = LOG_LEVELS[currentLogLevel] ?? LOG_LEVELS.INFO;

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get log file path
const getLogFilePath = (level) => {
  const date = new Date().toISOString().split("T")[0];
  return path.join(logsDir, `${level.toLowerCase()}-${date}.log`);
};

// Write to log file
const writeToFile = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${data ? ` ${JSON.stringify(data)}` : ""}\n`;
  
  try {
    fs.appendFileSync(getLogFilePath(level), logEntry);
  } catch (error) {
    console.error("Failed to write to log file:", error);
  }
};

// Format log message
const formatMessage = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (data) {
    return `${prefix} ${message}`;
  }
  return `${prefix} ${message}`;
};

// Logger object
export const logger = {
  error: (message, error = null) => {
    if (LOG_LEVELS.ERROR <= logLevelValue) {
      const errorData = error ? {
        message: error.message,
        stack: error.stack,
        ...error
      } : null;
      console.error(formatMessage("ERROR", message, errorData));
      writeToFile("ERROR", message, errorData);
    }
  },

  warn: (message, data = null) => {
    if (LOG_LEVELS.WARN <= logLevelValue) {
      console.warn(formatMessage("WARN", message, data));
      writeToFile("WARN", message, data);
    }
  },

  info: (message, data = null) => {
    if (LOG_LEVELS.INFO <= logLevelValue) {
      console.log(formatMessage("INFO", message, data));
      writeToFile("INFO", message, data);
    }
  },

  debug: (message, data = null) => {
    if (LOG_LEVELS.DEBUG <= logLevelValue) {
      console.debug(formatMessage("DEBUG", message, data));
      writeToFile("DEBUG", message, data);
    }
  },

  // Request logger
  request: (req, res, duration) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent")
    };
    logger.info("HTTP Request", logData);
  }
};

export default logger;

