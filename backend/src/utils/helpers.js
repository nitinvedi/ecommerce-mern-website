import { ObjectId } from "mongodb";

/**
 * Convert string to ObjectId
 */
export const toObjectId = (id) => {
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  throw new Error("Invalid ObjectId");
};

/**
 * Convert ObjectId to string
 */
export const toString = (id) => {
  if (typeof id === "string") return id;
  if (id instanceof ObjectId) return id.toString();
  return String(id);
};

/**
 * Generate random string
 */
export const generateRandomString = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate random number
 */
export const generateRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Sleep/delay function
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove undefined/null values from object
 */
export const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  );
};

/**
 * Paginate array
 */
export const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit)
    }
  };
};

/**
 * Calculate pagination metadata
 */
export const getPagination = (page = 1, limit = 10, total = 0) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

/**
 * Sort array by field
 */
export const sortBy = (array, field, order = "asc") => {
  const sorted = [...array];
  sorted.sort((a, b) => {
    if (order === "asc") {
      return a[field] > b[field] ? 1 : -1;
    } else {
      return a[field] < b[field] ? 1 : -1;
    }
  });
  return sorted;
};

/**
 * Group array by field
 */
export const groupBy = (array, field) => {
  return array.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = "INR", locale = "en-IN") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(amount);
};

/**
 * Truncate string
 */
export const truncate = (str, length = 50, suffix = "...") => {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Slugify string
 */
export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Check if value is empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Get nested object value safely
 */
export const getNestedValue = (obj, path, defaultValue = null) => {
  const keys = path.split(".");
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result;
};

export default {
  toObjectId,
  toString,
  generateRandomString,
  generateRandomNumber,
  sleep,
  deepClone,
  removeEmpty,
  paginate,
  getPagination,
  sortBy,
  groupBy,
  calculatePercentage,
  formatCurrency,
  truncate,
  capitalize,
  slugify,
  isEmpty,
  getNestedValue
};

