// Application Constants

// User Roles
export const USER_ROLES = {
  USER: "user",
  TECHNICIAN: "technician",
  ADMIN: "admin"
};

// Order Status
export const ORDER_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

// Repair Status
export const REPAIR_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  DIAGNOSED: "Diagnosed",
  REPAIRING: "Repairing",
  QUALITY_CHECK: "Quality Check",
  COMPLETED: "Completed",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  CREDIT_CARD: "Credit Card",
  DEBIT_CARD: "Debit Card",
  UPI: "UPI",
  NET_BANKING: "Net Banking"
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  MOBILE: "Mobile",
  TABLET: "Tablet",
  LAPTOP: "Laptop",
  ACCESSORIES: "Accessories",
  PARTS: "Parts",
  OTHER: "Other"
};

// Device Types
export const DEVICE_TYPES = {
  MOBILE: "Mobile",
  TABLET: "Tablet",
  LAPTOP: "Laptop"
};

// Repair Issues
export const REPAIR_ISSUES = {
  SCREEN_DAMAGE: "Screen Damage",
  BATTERY: "Battery",
  CAMERA: "Camera",
  MIC: "Mic",
  NOT_TURNING_ON: "Not Turning On",
  OTHER: "Other"
};

// Technician Specializations
export const TECHNICIAN_SPECIALIZATIONS = {
  MOBILE: "Mobile",
  TABLET: "Tablet",
  LAPTOP: "Laptop",
  SCREEN_REPAIR: "Screen Repair",
  BATTERY_REPLACEMENT: "Battery Replacement",
  SOFTWARE: "Software",
  HARDWARE: "Hardware",
  OTHER: "Other"
};

// Technician Availability
export const TECHNICIAN_AVAILABILITY = {
  AVAILABLE: "Available",
  BUSY: "Busy",
  ON_LEAVE: "On Leave",
  UNAVAILABLE: "Unavailable"
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Not authorized",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation error",
  SERVER_ERROR: "Server error",
  DUPLICATE_ENTRY: "Duplicate entry",
  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_EXPIRED: "Token expired",
  TOKEN_INVALID: "Invalid token"
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: "Created successfully",
  UPDATED: "Updated successfully",
  DELETED: "Deleted successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  REGISTRATION_SUCCESS: "Registration successful"
};

// Collection Names
export const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  ORDERS: "orders",
  REPAIRS: "repairs",
  TECHNICIANS: "technicians"
};

export default {
  USER_ROLES,
  ORDER_STATUS,
  REPAIR_STATUS,
  PAYMENT_METHODS,
  PRODUCT_CATEGORIES,
  DEVICE_TYPES,
  REPAIR_ISSUES,
  TECHNICIAN_SPECIALIZATIONS,
  TECHNICIAN_AVAILABILITY,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  COLLECTIONS
};

