import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { admin, protectAdmin } from "../middleware/adminMiddleware.js";
import { technician, protectAdminOrTechnician } from "../middleware/technicianMiddleware.js";
import {
  createRepair,
  getMyRepairs,
  getAllRepairs,
  getRepairById,
  getRepairByTrackingId,
  updateRepair,
  addStatusUpdate,
  deleteRepair
} from "../controllers/repairController.js";
import { uploadRepairImages, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public route (for tracking)
router.get("/track/:trackingId", getRepairByTrackingId);

// Protected routes
router.post("/", protect, uploadRepairImages, handleUploadError, createRepair);
router.get("/my-repairs", protect, getMyRepairs);
router.get("/:id", protect, getRepairById);

// Admin/Technician routes
router.get("/", protectAdminOrTechnician, getAllRepairs);
router.put("/:id", protectAdminOrTechnician, updateRepair);
router.post("/:id/status", protectAdminOrTechnician, addStatusUpdate);

// Admin only routes
router.delete("/:id", protectAdmin, deleteRepair);

export default router;

