import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authRateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);

export default router;
