import { protect } from "./authMiddleware.js";

// Technician only middleware - must be used after protect middleware
export const technician = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login"
    });
  }

  if (req.user.role !== "technician") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Technician privileges required"
    });
  }

  next();
};

// Admin or Technician middleware
export const adminOrTechnician = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, please login"
    });
  }

  if (req.user.role !== "admin" && req.user.role !== "technician") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin or Technician privileges required"
    });
  }

  next();
};

// Combined middleware: protect + technician
export const protectTechnician = [protect, technician];

// Combined middleware: protect + admin or technician
export const protectAdminOrTechnician = [protect, adminOrTechnician];

