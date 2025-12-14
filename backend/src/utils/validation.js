import { ObjectId } from "mongodb";

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic validation)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
  return ObjectId.isValid(id);
};

/**
 * Validate required fields
 */
export const validateRequired = (data, fields) => {
  const missing = [];
  
  fields.forEach((field) => {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      missing.push(field);
    }
  });

  return {
    isValid: missing.length === 0,
    missing
  };
};

/**
 * Validate string length
 */
export const validateLength = (str, min, max) => {
  if (typeof str !== "string") return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  
  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }
  
  // Optional: Add more password strength checks
  // if (!/[A-Z]/.test(password)) {
  //   errors.push("Password must contain at least one uppercase letter");
  // }
  // if (!/[a-z]/.test(password)) {
  //   errors.push("Password must contain at least one lowercase letter");
  // }
  // if (!/[0-9]/.test(password)) {
  //   errors.push("Password must contain at least one number");
  // }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str.trim().replace(/[<>]/g, "");
};

/**
 * Validate URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate date
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate number range
 */
export const validateRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validate array
 */
export const isValidArray = (arr, minLength = 0, maxLength = Infinity) => {
  if (!Array.isArray(arr)) return false;
  return arr.length >= minLength && arr.length <= maxLength;
};

/**
 * Validate enum value
 */
export const isValidEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

export default {
  isValidEmail,
  isValidPhone,
  isValidObjectId,
  validateRequired,
  validateLength,
  validatePassword,
  sanitizeString,
  isValidUrl,
  isValidDate,
  validateRange,
  isValidArray,
  isValidEnum
};

