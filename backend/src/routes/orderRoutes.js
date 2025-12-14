import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrders
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

// Update an order (protected)
router.put("/:id", protect, updateOrder);

// Delete an order (protected)
router.delete("/:id", protect, deleteOrder);

export default router;

