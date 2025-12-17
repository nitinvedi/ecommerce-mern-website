import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  contactSupport
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* ================= PUBLIC ROUTES ================= */

// Contact / Support (no auth required)
router.post("/contact", contactSupport);

/* ================= USER ROUTES ================= */

// User's own profile
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

/* ================= ADMIN ROUTES ================= */

router.get("/", protectAdmin, getAllUsers);
router.get("/:id", protectAdmin, getUserById);
router.put("/:id", protectAdmin, updateUser);
router.delete("/:id", protectAdmin, deleteUser);

export default router;
