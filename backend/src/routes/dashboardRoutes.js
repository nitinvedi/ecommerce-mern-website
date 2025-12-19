import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as dashboardController from "../controllers/dashboardController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get dashboard summary
router.get("/summary", dashboardController.getDashboardSummary);

// Get my orders with filters
router.get("/orders", dashboardController.getMyOrders);

// Reorder
router.post("/orders/:orderId/reorder", dashboardController.reorder);

export default router;
