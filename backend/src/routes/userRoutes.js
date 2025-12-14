import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin, protectAdmin } from "../middleware/adminMiddleware.js";
import {
  getMyProfile,
  updateMyProfile,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
} from "../controllers/userController.js";

const router = express.Router();

// Protected routes (user's own profile)
router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

// Admin routes
router.get("/", protectAdmin, getAllUsers);
router.get("/:id", protectAdmin, getUserById);
router.put("/:id", protectAdmin, updateUser);
router.delete("/:id", protectAdmin, deleteUser);

export default router;

