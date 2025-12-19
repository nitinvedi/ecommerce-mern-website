import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder
} from "../controllers/orderController.js";

const router = express.Router();

// Create a new order (protected)
router.post("/", protect, createOrder);

// Get all orders for the logged-in user (protected)
router.get("/my-orders", protect, getMyOrders);

// Get all orders (admin only)
router.get("/", protectAdmin, getAllOrders);

// Get a single order by ID (protected)
router.get("/:id", protect, getOrderById);

// Update order (admin)
router.put("/:id", protect, protectAdmin, updateOrder);

// Update order status (admin) - with notifications
router.patch("/:id/status", protect, protectAdmin, updateOrderStatus);

// Delete an order (protected)
router.delete("/:id", protect, deleteOrder);

export default router;
