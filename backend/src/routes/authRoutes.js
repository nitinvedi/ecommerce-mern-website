import express from "express";
import { registerUser, loginUser, googleLogin } from "../controllers/authController.js";
import { authRateLimit } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

export default router;
