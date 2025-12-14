import express from "express";
import { protectAdmin } from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getRecentActivities,
  updateOrderStatus,
  assignTechnician
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication
router.use(protectAdmin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activities", getRecentActivities);

// Order management
router.put("/orders/:id/status", updateOrderStatus);

// Repair management
router.post("/repairs/:repairId/assign-technician", assignTechnician);

export default router;

