import { protect } from "./authMiddleware.js";

// Admin only middleware - must be used after protect middleware
export const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login"
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required"
    });
  }

  next();
};

// Combined middleware: protect + admin
export const protectAdmin = [protect, admin];

