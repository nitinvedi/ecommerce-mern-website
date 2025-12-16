import express from "express";
import { protectAdmin } from "../middleware/adminMiddleware.js";
import {
  getDashboardStats,
  getRecentActivities,
  updateOrderStatus,
  assignTechnician,
  getAllUsers
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require admin access
router.use(protectAdmin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activities", getRecentActivities);

// Users
router.get("/users", getAllUsers);

// Orders
router.put("/orders/:id/status", updateOrderStatus);

// Repairs
router.post("/repairs/:repairId/assign-technician", assignTechnician);

export default router;
