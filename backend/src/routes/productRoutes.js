import express from "express";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { admin, protectAdmin } from "../middleware/adminMiddleware.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview
} from "../controllers/productController.js";
import { uploadProductImages, handleUploadError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", optionalAuth, getProducts);
router.get("/:id", optionalAuth, getProductById);

// Protected routes
router.post("/:id/reviews", protect, addProductReview);

// Admin routes
router.post("/", protectAdmin, uploadProductImages, handleUploadError, createProduct);
router.put("/:id", protectAdmin, uploadProductImages, handleUploadError, updateProduct);
router.delete("/:id", protectAdmin, deleteProduct);

export default router;

