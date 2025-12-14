import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Get file name without extension
 */
export const getFileName = (filename) => {
  return path.basename(filename, path.extname(filename));
};

/**
 * Check if file exists
 */
export const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

/**
 * Delete file
 */
export const deleteFile = (filePath) => {
  try {
    if (fileExists(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

/**
 * Get file size
 */
export const getFileSize = (filePath) => {
  try {
    if (fileExists(filePath)) {
      const stats = fs.statSync(filePath);
      return stats.size;
    }
    return 0;
  } catch (error) {
    console.error("Error getting file size:", error);
    return 0;
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

/**
 * Validate file type
 */
export const isValidFileType = (filename, allowedTypes) => {
  const ext = getFileExtension(filename);
  return allowedTypes.includes(ext);
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName) => {
  const ext = getFileExtension(originalName);
  const name = getFileName(originalName);
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  return `${name}-${timestamp}-${random}${ext}`;
};

/**
 * Ensure directory exists
 */
export const ensureDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Get upload path
 */
export const getUploadPath = (subfolder = "") => {
  const basePath = path.join(__dirname, "../../uploads");
  const fullPath = subfolder ? path.join(basePath, subfolder) : basePath;
  ensureDirectory(fullPath);
  return fullPath;
};

/**
 * Get file URL
 */
export const getFileUrl = (filename, subfolder = "") => {
  const baseUrl = process.env.APP_URL || "http://localhost:5000";
  const path = subfolder ? `${subfolder}/${filename}` : filename;
  return `${baseUrl}/uploads/${path}`;
};

/**
 * Validate image file
 */
export const isValidImageFile = (filename) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return isValidFileType(filename, imageExtensions);
};

export default {
  getFileExtension,
  getFileName,
  fileExists,
  deleteFile,
  getFileSize,
  formatFileSize,
  isValidFileType,
  generateUniqueFilename,
  ensureDirectory,
  getUploadPath,
  getFileUrl,
  isValidImageFile
};

