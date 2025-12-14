import jwt from "jsonwebtoken";
import { getUserById } from "../models/User.js";
import { ObjectId } from "mongodb";

// Protect routes - verify JWT token and attach user to request
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided"
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      // Attach user to request object
      req.user = user;
      req.userId = user._id.toString();
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message
    });
  }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await getUserById(decoded.id);
        
        if (user) {
          req.user = user;
          req.userId = user._id.toString();
        }
      } catch (err) {
        // Token invalid, but continue without user
      }
    }

    next();
  } catch (error) {
    next();
  }
};
